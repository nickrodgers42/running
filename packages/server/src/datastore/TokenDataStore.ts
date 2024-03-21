import { Pool } from "pg";
import { StravaToken } from "../operation/exchangeTokenOperation";
import pino from "pino";

const log = pino()

export default class TokenDataStore {
    private pg: Pool

    constructor(pg: Pool) {
        this.pg = pg
    }

    async getUserId(username: string): Promise<number> {
        try {
            await this.pg.connect()
            const response = await this.pg.query('SELECT user_id FROM users WHERE username = $1::text', [username])
            console.log(response.rows)
            return 1
            // return response.rows[0].user_id
        } catch(error) {
            log.error(error)
            throw Error("No User id found")
        }
    }

    async saveStravaToken(username: string, token: StravaToken) {
        const userId = await this.getUserId(username)
        try {
            await this.pg.connect()
            const response = await this.pg.query(
                'INSERT INTO tokens(user_id, expires_at, refresh_token, access_token) VALUES($1::int, to_timestamp($2), $3, $4)',
                [userId.toString(), token.expiresAt.toString(), token.refreshToken.toString(), token.accessToken.toString()])
            console.log(response)
        } catch(error) {
            log.error(error)
            throw Error("Unable to save token")
        }
    }
}
