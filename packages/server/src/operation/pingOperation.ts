import { PingInput, PingOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"

export default class PingOperation implements OperationHandler<PingInput, PingOutput, OperationContext> {
    async handle(_input: PingInput, _context: OperationContext): Promise<PingOutput> {
        return {
            message: "Pong"
        }
    }
}
