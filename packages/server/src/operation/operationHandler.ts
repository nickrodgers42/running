import { Operation } from "@aws-smithy/server-common"

export interface OperationContext {}

export interface OperationHandler<I, O, Context> {
    handle: Operation<I, O, Context>
}
