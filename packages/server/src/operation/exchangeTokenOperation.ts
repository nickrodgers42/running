import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server";

export default async function ExchangeTokenOperation(input: ExchangeTokenInput, context: any): Promise<ExchangeTokenOutput> {
    return {
        content: "Hello world"
    }
}
