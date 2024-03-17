import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";

export default class ExchangeTokenOperation implements OperationHandler<ExchangeTokenInput, ExchangeTokenOutput, OperationContext> {
    async handle(_input: ExchangeTokenInput, _context: OperationContext): Promise<ExchangeTokenOutput> {
        const redirectUri = new URL("http://localhost:3000")
        return {
            content: redirectUri.toString(),
            responseCode: 301
        }
    }
}
