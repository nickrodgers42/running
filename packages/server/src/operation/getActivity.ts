import { GetActivityInput, GetActivityOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import ActivityDataStore from "../datastore/ActivityDataStore"
import { ActivitiesApi, DetailedActivity } from "strava"
import TokenDataStore from "../datastore/TokenDataStore"
import StravaToken from "../token/stravaToken"
import { keysToCamelCase } from "../utils"

export class GetActivity
    implements
        OperationHandler<GetActivityInput, GetActivityOutput, OperationContext>
{
    private activityDataStore: ActivityDataStore
    private tokenDataStore: TokenDataStore

    constructor(
        activityDataStore: ActivityDataStore,
        tokenDataStore: TokenDataStore,
    ) {
        this.activityDataStore = activityDataStore
        this.tokenDataStore = tokenDataStore
    }

    async handle(
        input: GetActivityInput,
        _context: OperationContext,
    ): Promise<GetActivityOutput> {
        if (input.id == undefined) {
            throw Error("id not found")
        }

        const activityExists = await this.activityDataStore.activityExists(
            input.id,
        )

        if (activityExists) {
            return {
                activity: await this.activityDataStore.getActivity(input.id),
            }
        }

        let token = await this.tokenDataStore.loadStravaToken(1)
        if (token.isExpired()) {
            token = await StravaToken.refresh(token)
            this.tokenDataStore.saveStravaToken(1, token)
        }

        const activityApi = new ActivitiesApi({
            accessToken: token.getAccessToken(),
        })
        const activity: DetailedActivity = keysToCamelCase(
            (await activityApi.getActivityById(Number(input.id))).data,
        )

        this.activityDataStore.saveActivity(1, activity, token)

        return {
            activity: {

            },
        }
    }
}
