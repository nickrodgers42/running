import { PingInput, PingOutput } from "@running/server"
import { OperationHandler } from "./operationHandler"

export default class PingOperation implements OperationHandler<PingInput, PingOutput, any> {
    async handle(_input: PingInput, _context: any): Promise<PingOutput> {
        return {
            message: "Pong"
        }
    }
}
