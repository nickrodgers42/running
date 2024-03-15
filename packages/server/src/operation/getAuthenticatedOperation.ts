import { GetAuthenticatedInput, GetAuthenticatedOutput } from "@running/server"

export default async function GetAuthenticatedOperation(input: GetAuthenticatedInput, context: any): Promise<GetAuthenticatedOutput> {
    const authUrl = new URL('https://www.strava.com');
    authUrl.pathname = "/oauth/authorize"
    authUrl.search = "?client_id=103299&response_type=code&redirect_uri=http://localhost:8080/exchangeToken&approval_prompt=force&scope=read"
    return {
        isAuthenticated: false,
        authUrl: authUrl.toString()
    }
}
