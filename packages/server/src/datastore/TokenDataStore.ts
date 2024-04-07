import { Pool } from "pg"
import StravaToken from "../token/stravaToken"
import Logger from "../logger/Logger"

const log = Logger.create()

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
        try {
            await this.loadStravaToken(username)
            return true
        } catch (err) {
            if (
                err instanceof DataStoreError &&
                (err as DataStoreError).message == "UserId not found"
            ) {
                return false
            }
            throw err
        }
    }

    async saveStravaToken(username: string, token: StravaToken) {
        const userId = await this.getUserId(username)
        try {
            await this.pg.query(
                `
                    INSERT INTO tokens(user_id, access_token, refresh_token, expires_at, token_type)
                    VALUES($1::int, to_timestamp($2), $3, $4, $5);
                `,
                [
                    userId.toString(),
                    token.getAccessToken(),
                    token.getRefreshToken(),
                    (token.getExpiresAt().getTime() / 1000).toString(),
                    token.getTokenType(),
                ],
            )
        } catch (error) {
            log.error(error)
            throw new DataStoreError("Unable to save token")
        }
    }

    async loadStravaToken(username: string): Promise<StravaToken> {
        const userId: number = await this.getUserId(username)
        try {
            const response = await this.pg.query(
                `
                    SELECT access_token, refresh_token, expires_at, token_type
                    FROM tokens
                    WHERE user_id=$1::int
                `,
                [userId],
            )
            if (response.rowCount != 1) {
                throw new DataStoreError("Strava Token not found")
            }

            const row = response.rows[0]

            return new StravaToken(
                row.access_token,
                row.refresh_token,
                row.expires_at,
                row.token_type,
            )
        } catch (err) {
            log.error(err)
            throw err
        }
    }
}
