import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import pino from "pino"
import TokenDataStore from "../datastore/TokenDataStore"
import StravaToken from "../token/stravaToken"

const log = pino()

export default class ExchangeTokenOperation
    implements
        OperationHandler<
            ExchangeTokenInput,
            ExchangeTokenOutput,
            OperationContext
        >
{
    private tokenDataStore: TokenDataStore

    constructor(tokenDataStore: TokenDataStore) {
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
            this.tokenDataStore.saveStravaToken(input.username, stravaToken)
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
