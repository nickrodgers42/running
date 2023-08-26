import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http"
import * as dotenv from "dotenv"
import http, { IncomingMessage, ServerResponse } from "http"
import { ExchangeTokenError, ExchangeTokenInput, ExchangeTokenOutput, getRunningServiceHandler } from "@running/server"
import { Operation } from "@aws-smithy/server-common"
import axios, { AxiosError, AxiosResponse } from 'axios'
import workspacesRoot from "find-yarn-workspace-root"

dotenv.config({ path: `${workspacesRoot()}/.env` })
const PORT = 8080

export interface ExchangeTokenContext { }

const ExchangeTokenOperation: Operation<
    ExchangeTokenInput,
    ExchangeTokenOutput,
    ExchangeTokenContext
> = async (input: ExchangeTokenInput, context: any) => {
    let response: AxiosResponse;
    try {
        response = await axios.post(`https://www.strava.com/oauth/token`, {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: input.exchangeToken,
                grant_type: "authorization_code"
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
    } catch(error) {
        if (error instanceof AxiosError) {
            console.log("Couldn't exchange token")
            console.log(error.message)
        }
        throw new ExchangeTokenError({ message: "Unable to exchange token for accessToken" })
    }
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
            httpResponse.headers["Access-Control-Allow-Headers"] =  "*"

            if (req.method !== "OPTIONS") {
                res.statusCode = httpResponse.statusCode
            }
            for (const key in httpResponse.headers) {
                if (Array.isArray(httpResponse.headers[key])) {
                    res.setHeader(key, httpResponse.headers[key].toString())
                }
                else {
                    res.setHeader(key, httpResponse.headers[key])
                }
            }
            console.log(httpResponse)
            console.log(res.getHeaders())
            console.log(res.statusCode)
            res.end(httpResponse.body)
        })

    })
    .listen(PORT)

server.on("listening", () => {
    console.log(`listening on port ${PORT}`)
})

