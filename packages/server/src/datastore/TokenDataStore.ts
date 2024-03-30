import { Pool } from "pg"
import pino from "pino"
import StravaToken from "../token/stravaToken"

const log = pino()

interface UserId {
    user_id: number
}

export default class TokenDataStore {
    private pg: Pool

    constructor(pg: Pool) {
        this.pg = pg
    }

    async getUserId(username: string): Promise<number> {
        try {
            await this.pg.connect()
            const response = await this.pg.query<UserId>(
                "SELECT user_id FROM users WHERE username = $1::text LIMIT 1;",
                [username],
            )
            log.info(response.rows)
            return 1
        } catch (error) {
            log.error(error)
            throw Error("No User id found")
        }
    }

    async hasToken(username: string) {
        const userId = await this.getUserId(username)
        try {
            await this.pg.connect()
            const response = await this.pg.query(
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
            await this.pg.connect()
            const response = await this.pg.query(
                `
                INSERT INTO tokens(user_id, expires_at, refresh_token, access_token)
                VALUES($1::int, to_timestamp($2), $3, $4);
                `,
                [
                    userId.toString(),
                    token.getExpiresAt().toString(),
                    token.getRefreshToken().toString(),
                    token.getAccessToken().toString(),
                ],
            )
            log.info(response)
        } catch (error) {
            log.error(error)
            throw Error("Unable to save token")
        }
    }
}
