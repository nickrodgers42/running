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
import AuthenticateOperation from "./operation/authenticateOperation"
import IsAuthenticatedOperation from "./operation/isAuthenticatedOperation"

const pg = new Pool({
    user: getOrThrow(process.env, EnvironmentVariables.POSTGRES_USER),
    password: getOrThrow(process.env, EnvironmentVariables.POSTGRES_PASSWORD),
    host: getOrThrow(process.env, EnvironmentVariables.POSTGRES_HOST),
    port: Number(getOrThrow(process.env, EnvironmentVariables.POSTGRES_PORT))
})

const userDataStore = new UserDataStore(pg)
const tokenDataStore = new TokenDataStore(pg)
const getAuthenticatedOperation = new GetAuthenticatedOperation()
const exchangeTokenOperation = new ExchangeTokenOperation(userDataStore, tokenDataStore)
const isAuthenticatedOperation = new IsAuthenticatedOperation(userDataStore, tokenDataStore)
const authenticatOperation = new AuthenticateOperation()

const runningServiceHander = getRunningServiceHandler({
    GetAuthenticated: getAuthenticatedOperation.handle.bind(
        getAuthenticatedOperation,
    ),
    Ping: new PingOperation().handle,
    ExchangeToken: exchangeTokenOperation.handle.bind(exchangeTokenOperation),
    Authenticate: authenticatOperation.handle,
    IsAuthenticated: isAuthenticatedOperation.handle.bind(isAuthenticatedOperation)
})

new SmithyServer(runningServiceHander).listen(SERVER_PORT)
