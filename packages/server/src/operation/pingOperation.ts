import { PingInput, PingOutput } from "@running/server"

export interface PingContext {}

export default async function PingOperation(input: PingInput, context: any): Promise<PingOutput> {
    return {
        message: "Pong"
    }
}
