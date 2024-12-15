import { getRunningServiceHandler } from "@running/server"
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
    Ping,
    SyncActivities,
} from "./operation"

const pg = new Pool({
    user: getOrThrow(process.env, EnvironmentVariables.POSTGRES_USER),
    password: getOrThrow(process.env, EnvironmentVariables.POSTGRES_PASSWORD),
    host: getOrThrow(process.env, EnvironmentVariables.POSTGRES_HOST),
    port: Number(getOrThrow(process.env, EnvironmentVariables.POSTGRES_PORT)),
})

const userDataStore = new UserDataStore(pg)
const tokenDataStore = new TokenDataStore(pg)
const athleteDataStore = new AthleteDataStore(
    pg,
    applyCaseMiddleware(axios.create()),
)

const exchangeToken = new ExchangeToken(userDataStore, tokenDataStore)
const isAuthenticated = new IsAuthenticated(userDataStore, tokenDataStore)
const getAthlete = new GetAthlete(athleteDataStore)
const authenticate = new Authenticate()
const getAthleteFromUsername = new GetAthleteFromUsername(
    userDataStore,
    tokenDataStore,
    athleteDataStore,
)
const listActivities = new ListActivities()
const syncActivities = new SyncActivities()
const getActivity = new GetActivity()

const runningServiceHander = getRunningServiceHandler({
    Ping: new Ping().handle,
    ExchangeToken: exchangeToken.handle.bind(exchangeToken),
    Authenticate: authenticate.handle,
    IsAuthenticated: isAuthenticated.handle.bind(isAuthenticated),
    GetAthlete: getAthlete.handle.bind(getAthlete),
    GetAthleteFromUsername: getAthleteFromUsername.handle.bind(
        getAthleteFromUsername,
    ),
    ListActivities: listActivities.handle.bind(listActivities),
    SyncActivities: syncActivities.handle.bind(syncActivities),
    GetActivity: getActivity.handle.bind(getActivity),
})

new SmithyServer(runningServiceHander).listen(SERVER_PORT)
