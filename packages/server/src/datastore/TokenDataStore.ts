import { Pool } from "pg";
import { StravaToken } from "../operation/exchangeTokenOperation";

export default class TokenDataStore {
    constructor(pg: Pool) {}

    saveStravaToken(username: string, token: StravaToken) {

    }
}
