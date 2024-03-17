import { getRunningServiceHandler } from "@running/server";
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation";
import PingOperation from "./operation/pingOperation";
import ExchangeTokenOperation from "./operation/exchangeTokenOperation";
import SmithyServer from "./server/server";
import { PORT } from "./constants";

const runningServiceHander = getRunningServiceHandler({
    GetAuthenticated: new GetAuthenticatedOperation().handle,
    Ping: new PingOperation().handle,
    ExchangeToken: new ExchangeTokenOperation().handle
})

new SmithyServer(runningServiceHander).listen(PORT)
