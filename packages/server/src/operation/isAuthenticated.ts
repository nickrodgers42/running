import { IsAuthenticatedInput, IsAuthenticatedOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";
import TokenDataStore from "../datastore/TokenDataStore";
import UserDataStore from "../datastore/UserDataStore";

export class IsAuthenticated implements OperationHandler<
    IsAuthenticatedInput,
    IsAuthenticatedOutput,
    OperationContext
> {
    private userDataStore: UserDataStore
    private tokenDataStore: TokenDataStore

    constructor(userDataStore: UserDataStore, tokenDataStore: TokenDataStore) {
        this.userDataStore = userDataStore
        this.tokenDataStore = tokenDataStore
    }

    async handle(
        input: IsAuthenticatedInput,
        _context: OperationContext
    ): Promise<IsAuthenticatedOutput> {
        if (input.username == undefined) {
            throw Error("No username found")
        }

        const userId = await this.userDataStore.getUserId(input.username)

        const hasToken = await this.tokenDataStore.hasToken(userId)

        return {
            isAuthenticated: hasToken
        }
    }
}
