import { LoginError, LoginInput, LoginOutput, ValidationException } from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import UserDataStore from "../datastore/UserDataStore"

export class Login
    implements OperationHandler<LoginInput, LoginOutput, OperationContext>
{
    private userDataStore: UserDataStore

    constructor(userDataStore: UserDataStore) {
        this.userDataStore = userDataStore
    }

    async handle(
        input: LoginInput,
        _context: OperationContext,
    ): Promise<LoginOutput> {
        if (!input.username || !input.password) {
            throw new ValidationException({
                message: "Username and password are required",
            })
        }

        const passwordIsValid = await this.userDataStore.validatePassword(input.username, input.password)
        if (!passwordIsValid) {
            throw new LoginError({
                message: "Username and password do not match"
            })
        }
        return {}
    }
}
