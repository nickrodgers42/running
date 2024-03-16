import { GetAuthenticatedInput, GetAuthenticatedOutput } from "@running/server"
import { CLIENT_ID, PORT } from "../constants";

export default async function GetAuthenticatedOperation(input: GetAuthenticatedInput, context: any): Promise<GetAuthenticatedOutput> {
    const authUrl = new URL('https://www.strava.com/oauth/authorize');

    const redirectUri = new URL(`http://localhost:${PORT}/exchangeToken`);
    const searchParams = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": redirectUri.toString(),
        "approval_prompt": "force",
        "scope": "read"
    }

    const search = Object.entries(searchParams).map(([key, value]) => `${key}=${value}`).join('&')
    authUrl.search = `?${search}`

    return {
        isAuthenticated: false,
        authUrl: authUrl.toString()
    }
}
