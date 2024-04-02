import { Pool } from "pg"
import pino from "pino"
import StravaToken, { TokenType } from "../token/stravaToken"

const log = pino()

export class DataStoreError extends Error {}

export default class TokenDataStore {
    private pg: Pool

    constructor(pg: Pool) {
        this.pg = pg
    }

    async getUserId(username: string): Promise<number> {
        try {
            const response = await this.pg.query(
                "SELECT user_id FROM users WHERE username = $1::text;",
                [username],
            )
            if (response.rowCount != 1) {
                throw new DataStoreError("UserId not found")
            }
            return Number(response.rows[0]["user_id"])
        } catch (error) {
            log.error(error)
            throw error
        }
    }

    async hasToken(username: string) {
        const userId = await this.getUserId(username)
        try {
            const client = await this.pg.connect()
            const response = await client.query(
                "SELECT user_id FROM tokens WHERE user_id = $1::int",
                [userId],
            )
            log.info(response)
            log.info(response.rows.length > 0)
            return response.rows.length > 0
        } catch (error) {
            log.error(error)
        }
    }

    async saveStravaToken(username: string, token: StravaToken) {
        const userId = await this.getUserId(username)
        try {
            const response = this.pg.query(
                `
                INSERT INTO tokens(user_id, expires_at, refresh_token, access_token, token_type)
                VALUES($1::int, to_timestamp($2), $3, $4, $5);
                `,
                [
                    userId.toString(),
                    (token.getExpiresAt().getTime() / 1000).toString(),
                    token.getRefreshToken(),
                    token.getAccessToken(),
                    token.getTokenType(),
                ],
            )
            log.info(response)
        } catch (error) {
            log.error(error)
            throw Error("Unable to save token")
        }
    }

    async loadStravaToken(username: string) {
        const userId: number = await this.getUserId(username)
        try {
            const response = await this.pg.query({
                text: `
                    SELECT user_id, access_token, refresh_token, expires_at, token_type
                    FROM tokens
                    WHERE user_id=$1::int
                `,
                values: [userId],
                rowMode: "array",
            })
            const [, accessToken, refreshToken, expiresAt] = response.rows[0]
            return new StravaToken(
                accessToken,
                refreshToken,
                expiresAt,
                TokenType.BEARER,
            )
        } catch (err) {
            log.error(err)
            throw Error("Unable to load strava token")
        }
    }
}
