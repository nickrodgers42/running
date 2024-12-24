import { ListActivitiesInput, ListActivitiesOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import ActivityDataStore from "../datastore/ActivityDataStore"

export class ListActivities
    implements
        OperationHandler<
            ListActivitiesInput,
            ListActivitiesOutput,
            OperationContext
        >
{
    private activityDataStore: ActivityDataStore

    constructor(activityDataStore: ActivityDataStore) {
        this.activityDataStore = activityDataStore
    }

    async handle(
        input: ListActivitiesInput,
        _context: OperationContext,
    ): Promise<ListActivitiesOutput> {
        return {
            activities: await this.activityDataStore.listActivities(),
        }
    }
}
