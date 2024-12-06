import { AuthenticationInput, AuthenticationOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";
import { CLIENT_ID, SERVER_PORT } from "../constants";

enum StravaScope {
    READ = 'read',
    READ_ALL = 'read_all',
    PROFILE_READ_ALL = 'profile:read_all',
    PROFILE_WRITE = 'profile:write',
    ACTIVITY_READ = 'activity:read',
    ACTIVITY_READ_ALL = 'activity:read_all',
    ACTIVITY_WRITE = 'activity:write',
}

export default class AuthenticateOperation implements OperationHandler<
AuthenticationInput,
AuthenticationOutput,
OperationContext
> {
    async handle(
        input: AuthenticationInput,
        _context: OperationContext
    ): Promise<AuthenticationOutput> {
        const authUrl = new URL("https://www.strava.com/oauth/authorize")

        if (input.username == undefined) {
            throw Error("No username found")
        }

        const redirectUri = new URL(
            `http://localhost:${SERVER_PORT}/exchangeToken/${input.username}`,
        )
        const searchParams = {
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri.toString(),
            approval_prompt: "force",
            scope: [
                StravaScope.READ_ALL,
                StravaScope.PROFILE_READ_ALL,
                StravaScope.ACTIVITY_READ_ALL
            ].join(',')
        }

        const search = Object.entries(searchParams)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
        authUrl.search = `?${search}`

        return {
            authUrl: authUrl.toString(),
        }
    }
}
