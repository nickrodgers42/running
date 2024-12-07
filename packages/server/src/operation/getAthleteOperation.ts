import { GetAthleteInput, GetAthleteOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";
import UserDataStore from "../datastore/UserDataStore";
import TokenDataStore from "../datastore/TokenDataStore";
import AthleteDataStore from "../datastore/AthleteDataStore";
import StravaToken from "../token/stravaToken";

export default class GetAthleteOperation implements OperationHandler<GetAthleteInput, GetAthleteOutput, OperationContext> {
    private userDataStore: UserDataStore
    private tokenDataaStore: TokenDataStore
    private athleteDataStore: AthleteDataStore

    constructor(userDataStore: UserDataStore, tokenDataaStore: TokenDataStore, athleteDataStore: AthleteDataStore) {
        this.userDataStore = userDataStore
        this.tokenDataaStore = tokenDataaStore
        this.athleteDataStore = athleteDataStore
    }

    async handle(
        input: GetAthleteInput,
        _context: OperationContext
    ): Promise<GetAthleteOutput> {
        if (!input.username) {
            throw Error("Username not found")
        }
        const userId = await this.userDataStore.getUserId(input.username)
        let token = await this.tokenDataaStore.loadStravaToken(userId)
        if (token.getExpiresAt().getTime() - new Date().getTime() < 10000) {
            token = await StravaToken.refresh(token)
            await this.tokenDataaStore.saveStravaToken(userId, token)
        }
        return {
            athlete: await this.athleteDataStore.getAthlete(userId, token)
        }
    }
}
