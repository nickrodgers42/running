import { CLIENT_ID, STRAVA_AUTH_ENDPOINT } from "../constants"
import axios from "axios"
import Logger from "../logger/Logger"

export class StravaAuthorizationError extends Error {}
export class MissingSecretError extends Error {}

const log = Logger.create()

export enum TokenType {
    BEARER = "bearer",
}

export enum GrantType {
    AUTHORIZATION_CODE = "authorization_code",
    REFRESH_TOKEN = "refresh_token",
}

interface StravaAuthParams {
    client_id: string
    client_secret: string
    code?: string
    refresh_token?: string
    grant_type: GrantType
}

export default class StravaToken {
    private static readonly authUrl: URL = STRAVA_AUTH_ENDPOINT
    private accessToken: string
    private refreshToken: string
    private tokenType: TokenType
    private expiresAt: Date

    constructor(
        accessToken: string,
        refreshToken: string,
        expiresAt: Date,
        tokenType: TokenType,
    ) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.expiresAt = expiresAt
        this.tokenType = tokenType
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt
    }

    getAccessToken(): string {
        return this.accessToken
    }

    getRefreshToken(): string {
        return this.refreshToken
    }

    getTokenType(): TokenType {
        return this.tokenType
    }

    getExpiresAt(): Date {
        return this.expiresAt
    }

    private static async exchangeTokens(
        queryParams: StravaAuthParams,
    ): Promise<StravaToken> {
        const response = await axios.post(this.authUrl.toString(), queryParams)
        const token = new StravaToken(
            response.data["access_token"],
            response.data["refresh_token"],
            new Date(response.data["expires_at"] * 1000),
            response.data["token_type"],
        )
        return token
    }

    static async fetchToken(exchangeCode: string): Promise<StravaToken> {
        if (process.env.CLIENT_SECRET == undefined) {
            throw new MissingSecretError(
                "Client Secret not found in environment",
            )
        }
        const queryParams: StravaAuthParams = {
            client_id: CLIENT_ID.toString(),
            client_secret: process.env.CLIENT_SECRET,
            code: exchangeCode,
            grant_type: GrantType.AUTHORIZATION_CODE,
        }

        try {
            log.info("Making a request to Strava for credentials")
            return await StravaToken.exchangeTokens(queryParams)
        } catch (err) {
            log.error(err)
            throw new StravaAuthorizationError(
                `Could not exchange token with strava. Error: ${err}`,
            )
        }
    }

    static async refresh(token: StravaToken): Promise<StravaToken> {
        if (process.env.CLIENT_SECRET == undefined) {
            throw new MissingSecretError(
                "Client Secret not found in environment",
            )
        }
        const queryParams: StravaAuthParams = {
            client_id: CLIENT_ID.toString(),
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: token.getRefreshToken(),
            grant_type: GrantType.REFRESH_TOKEN,
        }
        try {
            log.info("Refreshing token with Strava")
            return await StravaToken.exchangeTokens(queryParams)
        } catch (err) {
            log.error(err)
            throw new StravaAuthorizationError(
                `Could not refresh token with strava. Error ${err}`,
            )
        }
    }
}
