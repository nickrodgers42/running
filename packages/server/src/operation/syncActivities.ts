import { SyncActivitiesInput, SyncActivitiesOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import { ActivitiesApi, DetailedActivity, SummaryActivity } from "strava"
import TokenDataStore from "../datastore/TokenDataStore"
import StravaToken from "../token/stravaToken"
import applyCaseMiddleware from "axios-case-converter"
import axios, { AxiosResponse } from "axios"
import { keysToCamelCase } from "../utils"
import ActivityDataStore from "../datastore/ActivityDataStore"
import pino from "pino"

const log = pino()

export class SyncActivities
    implements
        OperationHandler<
            SyncActivitiesInput,
            SyncActivitiesOutput,
            OperationContext
        >
{
    private tokenDataStore: TokenDataStore
    private activityDataStore: ActivityDataStore

    constructor(
        tokenDataStore: TokenDataStore,
        activityDataStore: ActivityDataStore,
    ) {
        this.tokenDataStore = tokenDataStore
        this.activityDataStore = activityDataStore
    }

    async handle(
        _input: SyncActivitiesInput,
        _context: OperationContext,
    ): Promise<SyncActivitiesOutput> {
        let token = await this.tokenDataStore.loadStravaToken(1)
        if (token.isExpired()) {
            token = await StravaToken.refresh(token)
            this.tokenDataStore.saveStravaToken(1, token)
        }

        const activityApi = new ActivitiesApi(
            {
                accessToken: token.getAccessToken(),
            },
            undefined,
            applyCaseMiddleware(axios.create()),
        )

        let page = 1
        while (true) {
            const perPage = 30
            const before = undefined
            const after = undefined
            const listResponse: AxiosResponse<Array<SummaryActivity>> =
                await activityApi.getLoggedInAthleteActivities(
                    before,
                    after,
                    page,
                    perPage,
                )
            page += 1

            if (listResponse.status == 429) {
                log.info("Being throttled by Strava")
                return {}
            }

            if (listResponse.status !== 200) {
                log.info(
                    listResponse,
                    "Did not receive a successful response from strava",
                )
                throw Error("Did not receive a successful response from Strava")
            }

            const activities: Array<SummaryActivity> = keysToCamelCase(
                listResponse.data,
            )
            if (activities.length == 0) {
                break
            }

            activities.forEach(async (activity: SummaryActivity) => {
                log.info(`Activity ${activity.id}`)
                if (
                    activity.id == undefined ||
                    (await this.activityDataStore.activityExists(
                        activity.id.toString(),
                    ))
                ) {
                    log.info(`Activity ${activity.id} exists`)
                    return
                }
                log.info(`activity ${activity.id} not found, downloading from strava`)

                const response: AxiosResponse<DetailedActivity> =
                    await activityApi.getActivityById(activity.id)
                if (response.status == 429) {
                    log.info("Being throttled by Strava")
                    return {}
                }
                this.activityDataStore.saveActivity(1, response.data, token)
            })
        }
        return {}
    }
}
