import { PingInput, PingOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"

export class Ping
    implements OperationHandler<PingInput, PingOutput, OperationContext>
{
    async handle(
        _input: PingInput,
        _context: OperationContext,
    ): Promise<PingOutput> {
        console.log("context", _context)
        return {
            message: "Pong",
        }
    }
}
