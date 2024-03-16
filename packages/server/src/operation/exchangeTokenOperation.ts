import { ExchangeTokenInput, ExchangeTokenOutput } from "@running/server";

export default async function ExchangeTokenOperation(input: ExchangeTokenInput, context: any): Promise<ExchangeTokenOutput> {
    const redirectUri = new URL("http://localhost:3000")
    return {
        content: redirectUri.toString(),
        responseCode: 301
    }
}
