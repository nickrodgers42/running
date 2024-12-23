import { SyncActivitiesInput, SyncActivitiesOutput } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"

export class SyncActivities
    implements
        OperationHandler<
            SyncActivitiesInput,
            SyncActivitiesOutput,
            OperationContext
        >
{
    constructor() {}

    async handle(
        input: SyncActivitiesInput,
        _context: OperationContext,
    ): Promise<SyncActivitiesOutput> {
        return {}
    }
}
