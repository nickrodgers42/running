import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http"
import { getRunningServiceHandler } from "@running/server";
import http, { IncomingMessage, ServerResponse } from "http"
import { Logger} from 'tslog'
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation";
import PingOperation from "./operation/pingOperation";

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
    Ping: PingOperation
})

const logger = new Logger({ name: "main" })
const server = http
    .createServer((req: IncomingMessage, res: ServerResponse) => {
        logger.info("Recieved request")
        logger.info("Path:", req.url)
        logger.info("Method:", req.method)
        logger.info("Headers:", req.headers ?? "this request has no headers")
        const url = new URL(req.url || "", `http://${req.headers.host}`)
        logger.info("Url:", url)
        logger.info("Query:", convertQueryParams(url.searchParams))
        let body = ""

        req.on("data", (chunk) => {
            body += chunk
        })

        req.on("end", async () => {
            logger.info(
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
            logger.info(httpResponse)
            logger.info(res.getHeaders())
            logger.info(res.statusCode)
            res.end(httpResponse.body)
        })

    })
    .listen(PORT)

server.on("listening", () => {
    logger.info(`listening on port ${PORT}`)
})
