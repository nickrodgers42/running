import { getRunningServiceHandler } from "@running/server"
import GetAuthenticatedOperation from "./operation/getAuthenticatedOperation"
import PingOperation from "./operation/pingOperation"
import ExchangeTokenOperation from "./operation/exchangeTokenOperation"
import SmithyServer from "./server/server"
import { SERVER_PORT } from "./constants"
import { Pool } from "pg"
import TokenDataStore from "./datastore/TokenDataStore"
import UserDataStore from "./datastore/UserDataStore"
import { EnvironmentVariables, getOrThrow } from "./environmentVariables"

const pg = new Pool({
    user: getOrThrow(process.env, EnvironmentVariables.POSTGRES_USER),
    password: getOrThrow(process.env, EnvironmentVariables.POSTGRES_PASSWORD),
    host: getOrThrow(process.env, EnvironmentVariables.POSTGRES_HOST),
    port: Number(getOrThrow(process.env, EnvironmentVariables.POSTGRES_PORT))
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
