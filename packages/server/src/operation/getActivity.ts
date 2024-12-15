import { GetActivityInput, GetActivityOutput  } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";

export class GetActivity implements OperationHandler<
    GetActivityInput,
    GetActivityOutput,
    OperationContext
> {
    constructor() {}

    async handle(
        input: GetActivityInput,
        _context: OperationContext
    ): Promise<GetActivityOutput> {
        return {
            id: 'asd'
        }
    }
}
