import { jest } from "@jest/globals"
import TokenDataStore, {
    DataStoreError,
} from "../../src/datastore/TokenDataStore"
import { Pool } from "pg"
import StravaToken, { TokenType } from "../../src/token/stravaToken"

describe("TokenDataStore", () => {
    const pool = new Pool()
    const querySpy = jest.spyOn(pool, "query")
    const testUsername = "test-user"
    const testUserId = 1
    const datastore: TokenDataStore = new TokenDataStore(pool)
    const ORIGINAL_ENV = process.env
    const FAKE_CLIENT_SECRET = "fake-secret"
    const userIdQueryResponse = {
        command: "",
        oid: 1,
        fields: [],
        rowCount: 1,
        rows: [{ user_id: 1 }],
    }
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
    })

    test("Can get user ID", async () => {
        querySpy.mockResolvedValue(userIdQueryResponse)
        const userId = await datastore.getUserId(testUsername)
        expect(querySpy).toHaveBeenCalledWith(
            expect.stringContaining("SELECT"),
            [testUsername],
        )
        expect(userId).toEqual(testUserId)
    })

    test("getUserId throws Error", () => {
        querySpy.mockRejectedValue(new DataStoreError("No records returned"))
        expect(() => datastore.getUserId("test-user")).rejects.toThrow(
            DataStoreError,
        )
    })

    test("getUserId not found", () => {
        querySpy.mockResolvedValue({
            command: "",
            oid: 1,
            fields: [],
            rowCount: 0,
            rows: [],
        })
        expect(() => datastore.getUserId(testUsername)).rejects.toThrow(
            DataStoreError,
        )
        expect(() => datastore.getUserId(testUsername)).rejects.toThrow(
            "UserId not found",
        )
    })

    test("Able to load strava token", async () => {
        querySpy
            .mockResolvedValueOnce(userIdQueryResponse)
            .mockResolvedValue(tokenQueryResponse)
        const result = await datastore.loadStravaToken(testUsername)
        expect(result).toBeInstanceOf(StravaToken)
    })

    test("No token in the db", async () => {
        querySpy
            .mockResolvedValueOnce(userIdQueryResponse)
            .mockResolvedValueOnce({
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
        querySpy
            .mockResolvedValueOnce(userIdQueryResponse)
            .mockResolvedValue(tokenQueryResponse)
        const result = await datastore.hasToken(testUsername)
        expect(result).toBe(true)
        expect(querySpy).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("SELECT"),
            [testUsername],
        )
        expect(querySpy).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("SELECT"),
            [1],
        )
    })

    test("Can save strava token", async () => {
        querySpy.mockResolvedValueOnce(userIdQueryResponse)
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
        querySpy
            .mockResolvedValueOnce(userIdQueryResponse)
            .mockRejectedValueOnce(
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
