import { GetAuthenticatedInput, GetAuthenticatedOutput } from "@running/server"

export interface GetAuthenticatedContext { }

export default async function GetAuthenticatedOperation(input: GetAuthenticatedInput, context: any): Promise<GetAuthenticatedOutput> {
    return {
        isAuthenticated: false
    }
}
