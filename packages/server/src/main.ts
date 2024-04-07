import { getRunningServiceHandler } from "@running/server"
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation"
import PingOperation from "./operation/pingOperation"
import ExchangeTokenOperation from "./operation/exchangeTokenOperation"
import SmithyServer from "./server/server"
import { SERVER_PORT } from "./constants"
import { Pool } from "pg"
import TokenDataStore from "./datastore/TokenDataStore"
import { EnvLoader } from "./envLoader"
import UserDataStore from "./datastore/UserDataStore"

new EnvLoader().load()

const pg = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
})

const userDataStore = new UserDataStore(pg)
const tokenDataStore = new TokenDataStore(pg, userDataStore)
const getAuthenticatedOperation = new GetAuthenticatedOperation(tokenDataStore)
const exchangeTokenOperation = new ExchangeTokenOperation(tokenDataStore)

const runningServiceHander = getRunningServiceHandler({
    GetAuthenticated: getAuthenticatedOperation.handle.bind(
        getAuthenticatedOperation,
    ),
    Ping: new PingOperation().handle,
    ExchangeToken: exchangeTokenOperation.handle.bind(exchangeTokenOperation),
})

new SmithyServer(runningServiceHander).listen(SERVER_PORT)
