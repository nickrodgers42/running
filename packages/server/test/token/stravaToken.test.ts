import { jest } from "@jest/globals"
import { FileReader } from "../util"
import axios, { AxiosError } from "axios"
import StravaToken, {
    GrantType,
    StravaAuthorizationError,
    TokenType,
} from "../../src/token/stravaToken"
import { CLIENT_ID, STRAVA_AUTH_ENDPOINT } from "../../src/constants"

jest.mock("axios")
const mockedAxios = axios as jest.MockedFunction<typeof axios>
const ORIGINAL_ENV = process.env
const FAKE_CLIENT_SECRET = "fake-secret"
const TOKEN_JSON = JSON.parse(FileReader.readFile(
    "./test/resource/stravaExchangeTokenResponse.json"
))

beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV, CLIENT_SECRET: FAKE_CLIENT_SECRET }
})

afterEach(() => {
    jest.resetAllMocks()
})

test("Can exchange token with strava", async () => {
    mockedAxios.post.mockResolvedValue({
        data: TOKEN_JSON,
    })
    const stravaExchangeCode = "code"
    const token = await StravaToken.fetchToken(stravaExchangeCode)
    expect(mockedAxios.post).toHaveBeenCalledWith(
        STRAVA_AUTH_ENDPOINT.toString(),
        expect.objectContaining({
            code: stravaExchangeCode,
            grant_type: GrantType.AUTHORIZATION_CODE,
            client_id: CLIENT_ID.toString(),
            client_secret: FAKE_CLIENT_SECRET,
        }),
    )

    expect(token.getAccessToken()).toEqual(TOKEN_JSON["access_token"])
    expect(token.getRefreshToken()).toEqual(TOKEN_JSON["refresh_token"])
    expect(token.getTokenType()).toEqual(TOKEN_JSON["token_type"])
    expect(token.getExpiresAt()).toEqual(
        new Date(TOKEN_JSON["expires_at"] * 1000),
    )
})

test("Strava token exchange fails", async () => {
    mockedAxios.post.mockRejectedValue(
        new AxiosError("Request failed with status code 400", "400"),
    )
    const stravaExchangeCode = "code"
    expect(async () => {
        await StravaToken.fetchToken(stravaExchangeCode)
    }).rejects.toThrowError(StravaAuthorizationError)
    expect(mockedAxios.post).toHaveBeenCalledWith(
        STRAVA_AUTH_ENDPOINT.toString(),
        expect.objectContaining({
            code: stravaExchangeCode,
            grant_type: GrantType.AUTHORIZATION_CODE,
            client_id: CLIENT_ID.toString(),
            client_secret: FAKE_CLIENT_SECRET,
        }),
    )
})

test("Can refresh token with Strava", async () => {
    const oldRefreshToken = "old-refresh-token"
    const stravaToken = new StravaToken(
        "old-access-token",
        oldRefreshToken,
        new Date(0),
        TokenType.BEARER
    )
    expect(stravaToken.isExpired())
    mockedAxios.post.mockResolvedValue({
        data: TOKEN_JSON
    })

    const newToken = await StravaToken.refresh(stravaToken)
    expect(mockedAxios.post).toHaveBeenCalledWith(
        STRAVA_AUTH_ENDPOINT.toString(),
        expect.objectContaining({
            code: oldRefreshToken,
            grant_type: GrantType.REFRESH_TOKEN,
            client_id: CLIENT_ID.toString(),
            client_secret: FAKE_CLIENT_SECRET,
        }),
    )

    expect(newToken.getAccessToken()).toEqual(TOKEN_JSON["access_token"])
    expect(newToken.getRefreshToken()).toEqual(TOKEN_JSON["refresh_token"])
    expect(newToken.getTokenType()).toEqual(TOKEN_JSON["token_type"])
    expect(newToken.getExpiresAt()).toEqual(
        new Date(TOKEN_JSON["expires_at"] * 1000),
    )
})

test("Strava token refresh fails", async () => {
    const oldRefreshToken = "old-refresh-token"
    const stravaToken = new StravaToken(
        "old-access-token",
        oldRefreshToken,
        new Date(0),
        TokenType.BEARER
    )
    mockedAxios.post.mockRejectedValue(
        new AxiosError("Request failed with status code 400", "400"),
    )
    expect(async () => {
        await StravaToken.refresh(stravaToken)
    }).rejects.toThrowError(StravaAuthorizationError)
    expect(mockedAxios.post).toHaveBeenCalledWith(
        STRAVA_AUTH_ENDPOINT.toString(),
        expect.objectContaining({
            code: oldRefreshToken,
            grant_type: GrantType.REFRESH_TOKEN,
            client_id: CLIENT_ID.toString(),
            client_secret: FAKE_CLIENT_SECRET,
        }),
    )
})
