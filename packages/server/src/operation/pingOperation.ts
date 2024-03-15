import { PingInput, PingOutput } from "@running/server"

export default async function PingOperation(input: PingInput, context: any): Promise<PingOutput> {
    return {
        message: "Pong"
    }
}
