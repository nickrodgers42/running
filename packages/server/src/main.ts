import { getRunningServiceHandler } from "@running/server"
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
import GetAthleteOperation from "./operation/getAthleteOperation"
import AthleteDataStore from "./datastore/AthleteDataStore"
import applyCaseMiddleware from "axios-case-converter"
import axios from "axios"

const pg = new Pool({
    user: getOrThrow(process.env, EnvironmentVariables.POSTGRES_USER),
    password: getOrThrow(process.env, EnvironmentVariables.POSTGRES_PASSWORD),
    host: getOrThrow(process.env, EnvironmentVariables.POSTGRES_HOST),
    port: Number(getOrThrow(process.env, EnvironmentVariables.POSTGRES_PORT))
})

const userDataStore = new UserDataStore(pg)
const tokenDataStore = new TokenDataStore(pg)
const athleteDataStore = new AthleteDataStore(pg, applyCaseMiddleware(axios.create()))
const exchangeTokenOperation = new ExchangeTokenOperation(userDataStore, tokenDataStore)
const isAuthenticatedOperation = new IsAuthenticatedOperation(userDataStore, tokenDataStore)
const getAthleteOperation = new GetAthleteOperation(userDataStore, tokenDataStore, athleteDataStore)
const authenticatOperation = new AuthenticateOperation()

const runningServiceHander = getRunningServiceHandler({
    Ping: new PingOperation().handle,
    ExchangeToken: exchangeTokenOperation.handle.bind(exchangeTokenOperation),
    Authenticate: authenticatOperation.handle,
    IsAuthenticated: isAuthenticatedOperation.handle.bind(isAuthenticatedOperation),
    GetAthlete: getAthleteOperation.handle.bind(getAthleteOperation)
})

new SmithyServer(runningServiceHander).listen(SERVER_PORT)
