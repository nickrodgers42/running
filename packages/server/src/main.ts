import {
    getRunningServiceHandler,
    RunningServiceOperations,
} from "@running/server"
import SmithyServer from "./server/server"
import { SERVER_PORT } from "./constants"
import { Pool } from "pg"
import TokenDataStore from "./datastore/TokenDataStore"
import UserDataStore from "./datastore/UserDataStore"
import { EnvironmentVariables, getOrThrow } from "./environmentVariables"
import AthleteDataStore from "./datastore/AthleteDataStore"
import applyCaseMiddleware from "axios-case-converter"
import axios from "axios"
import {
    Authenticate,
    ExchangeToken,
    GetActivity,
    GetAthlete,
    GetAthleteFromUsername,
    IsAuthenticated,
    ListActivities,
    OperationHandler,
    Ping,
    SyncActivities,
} from "./operation"
import { Operation } from "@aws-smithy/server-common"
import ActivityDataStore from "./datastore/ActivityDataStore"

const pg = new Pool({
    user: getOrThrow(process.env, EnvironmentVariables.POSTGRES_USER),
    password: getOrThrow(process.env, EnvironmentVariables.POSTGRES_PASSWORD),
    host: getOrThrow(process.env, EnvironmentVariables.POSTGRES_HOST),
    port: Number(getOrThrow(process.env, EnvironmentVariables.POSTGRES_PORT)),
})

const axiosClient = applyCaseMiddleware(axios.create())
const userDataStore = new UserDataStore(pg)
const tokenDataStore = new TokenDataStore(pg)
const athleteDataStore = new AthleteDataStore(
    pg,
    axiosClient
)
const activityDataStore = new ActivityDataStore(undefined, axiosClient)

type OperationMap = {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key in RunningServiceOperations]: OperationHandler<any, any, any>
}
const operations: OperationMap = {
    Ping: new Ping(),
    ExchangeToken: new ExchangeToken(userDataStore, tokenDataStore),
    Authenticate: new Authenticate(),
    IsAuthenticated: new IsAuthenticated(userDataStore, tokenDataStore),
    GetAthlete: new GetAthlete(athleteDataStore),
    GetAthleteFromUsername: new GetAthleteFromUsername(
        userDataStore,
        tokenDataStore,
        athleteDataStore,
    ),
    GetActivity: new GetActivity(activityDataStore, tokenDataStore),
    ListActivities: new ListActivities(activityDataStore),
    SyncActivities: new SyncActivities(tokenDataStore, activityDataStore),
}

type HandlerMap = {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key in RunningServiceOperations]: Operation<any, any, any>
}
function bindHandlers(): HandlerMap {
    const serviceHandlers: Partial<HandlerMap> = {}
    Object.keys(operations).forEach((key) => {
        const operationKey = key as RunningServiceOperations
        const operationHandler = operations[operationKey]
        serviceHandlers[operationKey] =
            operationHandler.handle.bind(operationHandler)
    })
    return serviceHandlers as HandlerMap
}

const runningServiceHander = getRunningServiceHandler(bindHandlers())

new SmithyServer(runningServiceHander).listen(SERVER_PORT)
