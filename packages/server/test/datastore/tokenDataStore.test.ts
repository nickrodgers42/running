import { jest } from "@jest/globals"
import TokenDataStore from "../../src/datastore/TokenDataStore"
import { Pool } from "pg"
import StravaToken, { TokenType } from "../../src/token/stravaToken"
import { DataStoreError } from "../../src/datastore/Error"
import UserDataStore from "../../src/datastore/UserDataStore"

describe("TokenDataStore", () => {
    const pool = new Pool()
    const querySpy = jest.spyOn(pool, "query")
    const userDatastore = new UserDataStore(pool)
    const userSpy = jest.spyOn(userDatastore, "getUserId")
    const testUserId = 1
    const testUsername = "test-user"
    const datastore: TokenDataStore = new TokenDataStore(pool, userDatastore)
    const ORIGINAL_ENV = process.env
    const FAKE_CLIENT_SECRET = "fake-secret"
    const tokenQueryResponse = {
        command: "",
        oid: 1,
        fields: [],
        rowCount: 1,
        rows: [
            {
                access_token: "some-token",
                refresh_token: "some-token",
                expires_at: 0,
                token_type: "Bearer",
            },
        ],
    }

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()
        process.env = { ...ORIGINAL_ENV, CLIENT_SECRET: FAKE_CLIENT_SECRET }
        userSpy.mockResolvedValue(testUserId)
    })

    test("Able to load strava token", async () => {
        querySpy.mockResolvedValue(tokenQueryResponse)
        const result = await datastore.loadStravaToken(testUsername)
        expect(result).toBeInstanceOf(StravaToken)
    })

    test("No token in the db", async () => {
        querySpy.mockResolvedValueOnce({
            command: "",
            oid: 1,
            fields: [],
            rowCount: 0,
            rows: [],
        })
        expect(() => datastore.loadStravaToken(testUsername)).rejects.toThrow(
            "Strava Token not found",
        )
    })

    test("hasToken finds token", async () => {
        querySpy.mockResolvedValue(tokenQueryResponse)
        const result = await datastore.hasToken(testUsername)
        expect(result).toBe(true)
        expect(querySpy).toHaveBeenCalledWith(
            expect.stringContaining("SELECT"),
            [1],
        )
    })

    test("Can save strava token", async () => {
        const token = new StravaToken(
            "accessToken",
            "refreshToken",
            new Date(0),
            TokenType.BEARER,
        )
        await datastore.saveStravaToken(testUsername, token)
        expect(querySpy).toHaveBeenCalledWith(
            expect.stringContaining("INSERT"),
            [
                testUserId.toString(),
                token.getAccessToken(),
                token.getRefreshToken(),
                (token.getExpiresAt().getTime() / 1000).toString(),
                token.getTokenType(),
            ],
        )
    })

    test("Saving strava token throws an error", async () => {
        querySpy.mockRejectedValueOnce(
            new DataStoreError("Database could not save"),
        )
        const token = new StravaToken(
            "accessToken",
            "refreshToken",
            new Date(0),
            TokenType.BEARER,
        )
        expect(datastore.saveStravaToken(testUsername, token)).rejects.toThrow(
            "Unable to save token",
        )
    })
})
