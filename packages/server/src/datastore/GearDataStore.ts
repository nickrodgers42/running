import { DetailedGear } from "strava"
import sql from "./database"

export default class GearDataStore {
    private dbClient: typeof sql

    constructor(dbClient?: typeof sql) {
        this.dbClient = dbClient ?? sql
    }

    async hasGear(gearId: string, sqlClient?: typeof sql): Promise<boolean> {
        const db = sqlClient ?? this.dbClient
        const response = await db`
            SELECT EXISTS (SELECT id FROM gear WHERE id = ${gearId})
        `
        if (response.length > 0) {
            return Boolean(response[0].exists)
        }
        return false
    }

    async saveGear(gear: DetailedGear, sqlClient?: typeof sql) {
        const db = sqlClient ?? this.dbClient
        await db`
            INSERT INTO gear(
                id, resource_state, primary_gear, name, distance, brand_name,
                model_name, frame_type, description
            )
            VALUES (
                ${gear.id ?? null},
                ${gear.resourceState ?? null},
                ${gear.primary ?? null},
                ${gear.name ?? null},
                ${gear.distance ?? null},
                ${gear.brandName ?? null},
                ${gear.modelName ?? null},
                ${gear.frameType ?? null},
                ${gear.description ?? null}
            )
        `
    }
}
