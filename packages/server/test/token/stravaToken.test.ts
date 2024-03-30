import { jest } from "@jest/globals"
import { FileReader } from "../util"
import axios from "axios"
import StravaToken from "../../src/token/stravaToken"

jest.mock("axios")
const mockedAxios = axios as jest.MockedFunction<typeof axios>

test("Can exchange token with strava", async () => {
    const data = FileReader.readFile(
        "./test/resource/stravaExchangeTokenResponse.json",
    )
    const tokenJson = JSON.parse(data)
    mockedAxios.post.mockResolvedValue({
        data: tokenJson,
    })
    const token = await StravaToken.fetchToken("code")
    expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://www.strava.com/oauth/token",
        expect.objectContaining({
            code: "code",
            grant_type: "authorization_code",
            client_id: expect.any(String),
            client_secret: expect.any(String)
        })
    )

    expect(token.getAccessToken()).toEqual(tokenJson["access_token"])
    expect(token.getRefreshToken()).toEqual(tokenJson["refresh_token"])
    expect(token.getTokenType()).toEqual(tokenJson["token_type"])
    expect(token.getExpiresAt()).toEqual(new Date(tokenJson["expires_at"] * 1000))
})
