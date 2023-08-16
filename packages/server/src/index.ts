import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http"
import * as dotenv from "dotenv"
import http, { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http"
import { ExchangeTokenInput, ExchangeTokenOutput, getRunningServiceHandler } from "@running/server"
import { Operation } from "@aws-smithy/server-common"
import axios from 'axios'

dotenv.config()
const PORT = 8080

export interface ExchangeTokenContext { }

const ExchangeTokenOperation: Operation<
    ExchangeTokenInput,
    ExchangeTokenOutput,
    ExchangeTokenContext
> = async (input: ExchangeTokenInput, context: any) => {
    console.log("exchange token")
    const response = await axios.post(`https://www.strava.com/oauth/token`, {
            client_id: 103299,
            client_secret: "",
            code: input.exchangeToken,
            grant_type: "authorization_code"
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    console.log(response.data)
    return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        athlete: response.data.athlete,
        expiresAt: response.data.expires_at,
        expiresIn: response.data.expires_in
    }
}

const runningServiceHander = getRunningServiceHandler({
    ExchangeToken: ExchangeTokenOperation
})

const convertHeaders = (
    headers: IncomingHttpHeaders
): Record<string, string> => {
    const convertedHeaders: Record<string, string> = {}
    for (const header in headers) {
        if (headers[header] === undefined) {
            continue
        }
        if (Array.isArray(headers[header])) {
            convertedHeaders[header] = headers[header]!.toString()
        } else {
            convertedHeaders[header] = String(headers[header])
        }
    }
    return convertedHeaders
}

const convertQueryParams = (
    urLSearchParams: URLSearchParams
): Record<string, string | Array<String> | null> => {
    const convertedQueryParams: Record<string, string | Array<String> | null> =
        {}
    for (const [key, value] of urLSearchParams.entries()) {
        convertedQueryParams[key] = value
    }
    return convertedQueryParams
}

const server = http
    .createServer((req: IncomingMessage, res: ServerResponse) => {
        console.log("Recieved request")
        console.log("Path:", req.url)
        console.log("Method:", req.method)
        console.log("Headers:", req.headers ?? "this request has no headers")
        const url = new URL(req.url || "", `http://${req.headers.host}`)
        console.log("Url:", url)
        console.log("Query:", convertQueryParams(url.searchParams))
        let body = ""

        req.on("data", (chunk) => {
            body += chunk
        })

        req.on("end", async () => {
            console.log(
                "body:",
                body !== "" ? body : "this request has no body"
            )

            const httpRequest = new HttpRequest({
                method: req.method,
                path: url.pathname,
                port: 8080,
                headers: req.headers as any,
                body: body === "" ? undefined : Buffer.from(body),
                query: convertQueryParams(url.searchParams) as any,
            })
            const httpResponse: HttpResponse =
                await runningServiceHander.handle(httpRequest, {})
            httpResponse.headers['Access-Control-Allow-Origin'] = '*'
            console.log(httpResponse)
            httpResponse
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Headers", "*")
            res.end(httpResponse.body)
        })
    })
    .listen(PORT)

server.on("listening", () => {
    console.log(`listening on port ${PORT}`)
})

