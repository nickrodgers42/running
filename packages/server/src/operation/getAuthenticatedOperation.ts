import { GetAuthenticatedInput, GetAuthenticatedOutput } from "@running/server";
import { CLIENT_ID, SERVER_PORT, WEBSITE_PORT } from "../constants";
import { OperationContext, OperationHandler } from "./operationHandler";
import TokenDataStore from "../datastore/TokenDataStore";

export default class GetAuthenticatedOperation
    implements
        OperationHandler<
            GetAuthenticatedInput,
            GetAuthenticatedOutput,
            OperationContext
        >
{
    private tokenDataStore: TokenDataStore;

    constructor(tokenDataStore: TokenDataStore) {
        this.tokenDataStore = tokenDataStore;
    }

    async handle(
        input: GetAuthenticatedInput,
        _context: OperationContext,
    ): Promise<GetAuthenticatedOutput> {
        const authUrl = new URL("https://www.strava.com/oauth/authorize");

        if (input.username == undefined) {
            throw Error("No username found");
        }
        const hasToken = await this.tokenDataStore.hasToken(input.username);
        if (hasToken) {
            return {
                isAuthenticated: true,
                // this should be the web port not the server port
                authUrl: `http://localhost:${WEBSITE_PORT}`,
            };
        }

        const redirectUri = new URL(
            `http://localhost:${SERVER_PORT}/exchangeToken/${input.username}`,
        );
        const searchParams = {
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri.toString(),
            approval_prompt: "force",
            scope: "read",
        };

        const search = Object.entries(searchParams)
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
        authUrl.search = `?${search}`;

        return {
            isAuthenticated: false,
            authUrl: authUrl.toString(),
        };
    }
}
