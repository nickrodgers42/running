import { getRunningServiceHandler } from "@running/server";
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation";
import PingOperation from "./operation/pingOperation";
import ExchangeTokenOperation from "./operation/exchangeTokenOperation";
import SmithyServer from "./server/server";
import { PORT } from "./constants";
import { config as dotenv } from 'dotenv';
import findWorkspaceRoot from "find-yarn-workspace-root";
import { Pool } from "pg";
import TokenDataStore from "./datastore/TokenDataStore";

dotenv({ path: `${findWorkspaceRoot()}/.env`})

const pg = new Pool({
    host: 'database',
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
})

const tokenDataStore = new TokenDataStore(pg)

const exchangeTokenOperation = new ExchangeTokenOperation(tokenDataStore)

const runningServiceHander = getRunningServiceHandler({
    GetAuthenticated: new GetAuthenticatedOperation().handle,
    Ping: new PingOperation().handle,
    ExchangeToken: exchangeTokenOperation.handle.bind(exchangeTokenOperation)
})

new SmithyServer(runningServiceHander).listen(PORT)
