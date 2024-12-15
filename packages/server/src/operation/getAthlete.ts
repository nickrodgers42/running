import { GetAthleteInput, GetAthleteOutput } from "@running/server";
import { OperationContext, OperationHandler } from "./operationHandler";
import AthleteDataStore from "../datastore/AthleteDataStore";

export class GetAthlete implements OperationHandler<GetAthleteInput, GetAthleteOutput, OperationContext> {
    private athleteDataStore: AthleteDataStore

    constructor(athleteDataStore: AthleteDataStore) {
        this.athleteDataStore = athleteDataStore
    }

    async handle(
        input: GetAthleteInput,
        _context: OperationContext
    ): Promise<GetAthleteOutput> {
        return await this.athleteDataStore.getAthleteFromId(Number(input.id))
    }
}
