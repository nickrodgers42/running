import { Pool } from "pg"
import { DataStoreError } from "./Error"
import Logger from "../logger/Logger"
import sql from "./database"

const log = Logger.create()

export default class UserDataStore {
    private pg: Pool

    constructor(pg: Pool) {
        this.pg = pg
    }

    async createUser(username: string, password: string) {
        await sql`
            INSERT INTO users(
                id, username, password_hash
            )
            VALUES(
                DEFAULT, ${username},  crypt(${password}, gen_salt('md5'))
            )
        `
    }

    async validatePassword(username: string, password: string): Promise<boolean> {
        const response = await sql`
            SELECT (password_hash = crypt(${password}, password_hash))
            FROM users
            WHERE username = ${username}
        `
        console.log(response)
        if (response.length > 0) {
            return Boolean(response[0])
        }
        return false
    }

    async getUserId(username: string): Promise<number> {
        try {
            const response = await this.pg.query(
                "SELECT id FROM users WHERE username = $1;",
                [username],
            )
            if (response.rowCount != 1) {
                throw new DataStoreError("UserId not found")
            }
            return Number(response.rows[0]["id"])
        } catch (error) {
            log.error(error)
            throw error
        }
    }
}
