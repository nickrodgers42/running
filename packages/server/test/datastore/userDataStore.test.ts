import { jest } from "@jest/globals"
import { Pool } from "pg"
import { DataStoreError } from "../../src/datastore/Error"
import UserDataStore from "../../src/datastore/UserDataStore"

describe("UserDataStore", () => {
    const pool = new Pool()
    const querySpy = jest.spyOn(pool, "query")
    const datastore: UserDataStore = new UserDataStore(pool)
    const testUsername = "test-user"
    const testUserId = 1
    const userIdQueryResponse = {
        command: "",
        oid: 1,
        fields: [],
        rowCount: 1,
        rows: [{ user_id: 1 }],
    }

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
})
