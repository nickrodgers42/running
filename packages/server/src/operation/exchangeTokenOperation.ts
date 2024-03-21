import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";
import { CLIENT_ID } from "../constants";
import axios from 'axios'
import pino from "pino";
import TokenDataStore from "../datastore/TokenDataStore";

const log = pino()

class AuthorizationError extends Error { }

export interface StravaToken {
    tokenType: string
    expiresAt: number
    expiresIn: number
    refreshToken: string
    accessToken: string
}

export default class ExchangeTokenOperation implements OperationHandler<ExchangeTokenInput, ExchangeTokenOutput, OperationContext> {
    private tokenDataStore: TokenDataStore

    constructor(tokenDataStore: TokenDataStore) {
        this.tokenDataStore = tokenDataStore
    }

    async getTokenFromStrava(code: string): Promise<StravaToken> {
        const authUrl = new URL("https://www.strava.com/oauth/token")
        const queryParams = {
            "client_id": `${CLIENT_ID}`,
            "client_secret": `${process.env.CLIENT_SECRET}`,
            "code": `${code}`,
            "grant_type": "authorization_code"
        }

        try {
            log.info("Making a request to strava for credentials")
            const response = await axios.post(authUrl.toString(), queryParams)
            const token: StravaToken = {
                tokenType: response.data["token_type"],
                expiresAt: response.data["expires_at"],
                expiresIn: response.data["expires_in"],
                refreshToken: response.data["refresh_token"],
                accessToken: response.data["access_token"],
            }
            return token
        } catch (err) {
            throw new AuthorizationError(`Could not exchange token with strava. Error: ${err}`)
        }
    }

    async handle(input: ExchangeTokenInput, _context: OperationContext): Promise<ExchangeTokenOutput> {
        const redirectUri = new URL("http://localhost:3000")
        try {
            if (input.code == undefined || input.username == undefined) {
                throw Error("No code found")
            }
            const stravaToken: StravaToken = await this.getTokenFromStrava(input.code)
            this.tokenDataStore.saveStravaToken(input.username, stravaToken)
        } catch (err) {
            log.error(err)
            redirectUri.search = "Error=error"
        }
        return {
            content: redirectUri.toString(),
            responseCode: 301
        }
    }
}
