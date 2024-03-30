import pino from "pino"
import { CLIENT_ID } from "../constants"
import axios from "axios"

class StravaAuthorizationError extends Error {}

const log = pino()

export default class StravaToken {
    private static readonly authUrl: URL = new URL("https://www.strava.com/oauth/token")
    private accessToken: string
    private refreshToken: string
    private tokenType: string
    private expiresAt: Date

    constructor(
        accessToken: string,
        refreshToken: string,
        expiresAt: Date,
        tokenType: string,
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

    getTokenType(): string {
        return this.tokenType
    }

    getExpiresAt(): Date {
        return this.expiresAt
    }

    static async fetchToken(exchangeCode: string): Promise<StravaToken> {
        const queryParams = {
            client_id: `${CLIENT_ID}`,
            client_secret: `${process.env.CLIENT_SECRET}`,
            code: `${exchangeCode}`,
            grant_type: "authorization_code",
        }

        try {
            log.info("Making a request to strava for credentials")
            const response = await axios.post(
                this.authUrl.toString(),
                queryParams,
            )
            const token = new StravaToken(
                response.data["access_token"],
                response.data["refresh_token"],
                new Date(response.data["expires_at"] * 1000),
                response.data["token_type"],
            )
            return token
        } catch (err) {
            log.error(err)
            throw new StravaAuthorizationError(
                `Could not exchange token with strava. Error: ${err}`,
            )
        }
    }
}
