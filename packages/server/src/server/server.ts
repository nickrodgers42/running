import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http";
import { ServiceHandler } from "@aws-smithy/server-common";
import http, { IncomingMessage, Server, ServerResponse } from "http";
import pino from "pino";

const logger = pino()

export default class SmithyServer {
    private httpServer: Server<typeof IncomingMessage, typeof ServerResponse>
    private serviceHandler: ServiceHandler

    constructor(serviceHandler: ServiceHandler) {
        this.serviceHandler = serviceHandler
        this.httpServer = new http.Server()
        this.httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => this.handleRequest(req, res))
    }

    private convertQueryParams(urlSearchParams: URLSearchParams): Record<string, string | Array<string> | null> {
        const convertedQueryParams: Record<string, string | Array<string> | null> = {}
        for (const [key, value] of urlSearchParams.entries()) {
            convertedQueryParams[key] = value
        }
        return convertedQueryParams
    }

    private handleRequest(req: IncomingMessage, res: ServerResponse) {
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
                query: this.convertQueryParams(url.searchParams) as any,
            })

            logger.info({ ...httpRequest, body: body }, "Received Request")

            const httpResponse: HttpResponse = await this.serviceHandler.handle(httpRequest, {})

            httpResponse.headers['Access-Control-Allow-Origin'] = '*'
            httpResponse.headers["Access-Control-Allow-Headers"] = "*"

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
    }

    listen(port: number): SmithyServer {
        this.httpServer.on("listening", () => {
            logger.info(`listening on port ${port}`)
        })
        this.httpServer.listen(port)
        return this
    }
}
