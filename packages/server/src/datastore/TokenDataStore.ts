import { Pool, QueryConfigValues } from "pg"
import StravaToken from "../token/stravaToken"
import Logger from "../logger/Logger"
import { DataStoreError } from "./Error"

const log = Logger.create()

export default class TokenDataStore {
    private pg: Pool

    constructor(pg: Pool) {
        this.pg = pg
    }

    async hasToken(userId: number) {
        try {
            await this.loadStravaToken(userId)
            return true
        } catch (err) {
            if (
                err instanceof DataStoreError &&
                (err as DataStoreError).message.includes("not found")
            ) {
                return false
            }
            throw err
        }
    }

    async saveStravaToken(userId: number, token: StravaToken) {
        try {
            await this.pg.query(
                `
                    INSERT INTO tokens(
                        user_id, access_token, refresh_token, expires_at,
                        token_type)
                    VALUES($1, $2, $3, $4, $5)
                    ON CONFLICT (user_id)
                        DO UPDATE
                            SET access_token = $2, refresh_token = $3,
                                expires_at = $4, token_type = $5
                `,
                [
                    userId,
                    token.getAccessToken(),
                    token.getRefreshToken(),
                    token.getExpiresAt(),
                    token.getTokenType(),
                ] as QueryConfigValues<(number & string & Date)[]>,
            )
        } catch (error) {
            log.error(error)
            throw new DataStoreError("Unable to save token")
        }
    }

    async loadStravaToken(userId: number): Promise<StravaToken> {
        try {
            const response = await this.pg.query(
                `
                    SELECT access_token, refresh_token, expires_at, token_type
                    FROM tokens
                    WHERE user_id = $1
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
