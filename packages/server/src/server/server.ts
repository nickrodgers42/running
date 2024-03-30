import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http"
import { ServiceHandler } from "@aws-smithy/server-common"
import { HeaderBag, QueryParameterBag } from "@smithy/types"
import http, { IncomingMessage, Server, ServerResponse } from "http"
import pino from "pino"

const log = pino()

export default class SmithyServer {
    private httpServer: Server<typeof IncomingMessage, typeof ServerResponse>
    private serviceHandler: ServiceHandler
    private corsHeaders = {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
    }

    constructor(serviceHandler: ServiceHandler) {
        this.serviceHandler = serviceHandler
        this.httpServer = new http.Server()
        this.httpServer.on(
            "request",
            (req: IncomingMessage, res: ServerResponse) =>
                this.handleRequest(req, res),
        )
    }

    private handleRequest(req: IncomingMessage, res: ServerResponse) {
        const url = new URL(req.url || "", `http://${req.headers.host}`)
        const body: Uint8Array[] = []
        req.on("data", (chunk: Uint8Array) => {
            body.push(chunk)
        })
        req.on("end", async () => {
            if (req.method == "OPTIONS") {
                res.writeHead(200, {
                    ...this.corsHeaders,
                    allow: "OPTIONS,GET,HEAD,POST",
                })
                res.end()
                return
            }
            const httpRequest = new HttpRequest({
                method: req.method,
                path: url.pathname,
                port: url.port == "" ? undefined : Number(url.port),
                headers: req.headers as HeaderBag,
                body: Buffer.concat(body),
                query: Object.fromEntries(
                    url.searchParams,
                ) as QueryParameterBag,
            })

            log.info(
                { ...httpRequest, body: body.toString() },
                "Received Request",
            )

            const httpResponse: HttpResponse = await this.serviceHandler.handle(
                httpRequest,
                {},
            )
            httpResponse.headers = {
                ...httpResponse.headers,
                ...this.corsHeaders
            }

            log.info(httpResponse, "Response")
            res.writeHead(httpResponse.statusCode, httpResponse.headers)
            res.end(httpResponse.body)
        })
    }

    listen(port: number): SmithyServer {
        this.httpServer.on("listening", () => {
            log.info(`listening on port ${port}`)
        })
        this.httpServer.listen(port)
        return this
    }
}
