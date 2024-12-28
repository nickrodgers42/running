import {
    SignUpError,
    SignUpInput,
    SignUpOutput,
    ValidationException,
} from "@running/server"
import { OperationContext, OperationHandler } from "./operationHandler"
import UserDataStore from "../datastore/UserDataStore"
import Logger from "../logger/Logger"

const log = Logger.create()

export class SignUp
    implements OperationHandler<SignUpInput, SignUpOutput, OperationContext>
{
    private userDataStore: UserDataStore

    constructor(userDataStore: UserDataStore) {
        this.userDataStore = userDataStore
    }

    async handle(
        input: SignUpInput,
        _context: OperationContext,
    ): Promise<SignUpOutput> {
        if (!input.username || !input.password) {
            throw new ValidationException({
                message: "Username and password are required",
            })
        }

        try {
            await this.userDataStore.createUser(input.username, input.password)
        } catch (error) {
            log.error(error)
            throw new SignUpError({ message: "Unable to create user" })
        }
        return {}
    }
}
