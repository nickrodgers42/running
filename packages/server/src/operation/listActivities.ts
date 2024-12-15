import { ListActivitiesInput, ListActivitiesOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";

export class ListActivities implements OperationHandler<
    ListActivitiesInput,
    ListActivitiesOutput,
    OperationContext
> {
    constructor() {}

    async handle(
        input: ListActivitiesInput,
        _context: OperationContext
    ): Promise<ListActivitiesOutput> {
        return {
            activities: []
        }
    }
}
