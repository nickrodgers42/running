import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http"
import { getRunningServiceHandler } from "@running/server";
import http, { IncomingMessage, ServerResponse } from "http"
import { URL } from "url";
import pino from "pino";
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation";
import PingOperation from "./operation/pingOperation";
import ExchangeTokenOperation from "./operation/exchangeTokenOperation";

const PORT = 8080;

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
const runningServiceHander = getRunningServiceHandler({
    GetAuthenticated: GetAuthenticatedOperation,
    Ping: PingOperation,
    ExchangeToken: ExchangeTokenOperation
})

const logger = pino()
const server = http
    .createServer((req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url || "", `http://${req.headers.host}`)
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })
        req.on("end", async () => {
            const httpRequest = new HttpRequest({
                method: req.method,
                path: url.pathname,
                port: 8080,
                headers: req.headers as any,
                body: body === "" ? undefined : Buffer.from(body),
                query: convertQueryParams(url.searchParams) as any,
            })
            
            logger.info({...httpRequest, body: body}, "Received Request")

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
            logger.info(httpResponse, "Response")
            res.end(httpResponse.body)
        })

    })
    .listen(PORT)

server.on("listening", () => {
    logger.info(`listening on port ${PORT}`)
})
