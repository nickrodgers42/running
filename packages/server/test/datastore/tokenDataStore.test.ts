import { jest } from "@jest/globals"
import TokenDataStore from "../../src/datastore/TokenDataStore"
import { Pool, QueryResult, QueryResultRow } from "pg"

const ORIGINAL_ENV = process.env
const FAKE_CLIENT_SECRET = "fake-secret"

beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    process.env = { ...ORIGINAL_ENV, CLIENT_SECRET: FAKE_CLIENT_SECRET }
})

test("Can get user ID", async () => {
    const pool = new Pool()
    const testUsername = "test-user"
    const testUserId = 1
    const poolSpy = jest
        .spyOn(pool, "query")
        .mockImplementation(async (): Promise<QueryResult<QueryResultRow>> => {
            return {
                command: "",
                oid: 1,
                fields: [],
                rowCount: 1,
                rows: [{ user_id: testUserId }],
            }
        })
    const datastore: TokenDataStore = new TokenDataStore(pool)
    const userId = await datastore.getUserId(testUsername)
    expect(poolSpy).toHaveBeenCalledWith(expect.any(String), [testUsername])
    expect(userId).toEqual(testUserId)
})
