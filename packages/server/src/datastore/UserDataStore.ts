import { Pool } from "pg"
import { DataStoreError } from "./Error"
import Logger from "../logger/Logger"

const log = Logger.create()

export default class UserDataStore {
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
}