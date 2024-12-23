import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import pino from "pino"
import TokenDataStore from "../datastore/TokenDataStore"
import StravaToken from "../token/stravaToken"
import UserDataStore from "../datastore/UserDataStore"

const log = pino()

export class ExchangeToken
    implements
        OperationHandler<
            ExchangeTokenInput,
            ExchangeTokenOutput,
            OperationContext
        >
{
    private userDataStore: UserDataStore
    private tokenDataStore: TokenDataStore

    constructor(userDataStore: UserDataStore, tokenDataStore: TokenDataStore) {
        this.userDataStore = userDataStore
        this.tokenDataStore = tokenDataStore
    }

    async handle(
        input: ExchangeTokenInput,
        _context: OperationContext,
    ): Promise<ExchangeTokenOutput> {
        const redirectUri = new URL("http://localhost:3000")
        try {
            if (input.code == undefined || input.username == undefined) {
                throw Error("No code found")
            }
            const stravaToken: StravaToken = await StravaToken.fetchToken(
                input.code,
            )
            const userId: number = await this.userDataStore.getUserId(
                input.username,
            )
            await this.tokenDataStore.saveStravaToken(userId, stravaToken)
        } catch (err) {
            log.error(err)
            redirectUri.search = "Error=error"
        }
        return {
            content: redirectUri.toString(),
            responseCode: 301,
        }
    }
}
