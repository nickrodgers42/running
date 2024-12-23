import { Pool, QueryConfigValues } from "pg"
import StravaToken from "../token/stravaToken"
import { AthletesApi, DetailedAthlete } from "strava"
import { AxiosInstance } from "axios"
import { Athlete } from "@running/server"

export default class AthleteDataStore {
    private pg: Pool
    private axiosClient: AxiosInstance

    constructor(pg: Pool, axiosClient: AxiosInstance) {
        this.pg = pg
        this.axiosClient = axiosClient
    }

    async athleteExists(userId: number) {
        const response = await this.pg.query(
            `
            SELECT EXISTS (SELECT user_id FROM athletes WHERE user_id = $1)
        `,
            [userId.toString()],
        )

        console.log(response)
        if (response.rowCount && response.rowCount > 0) {
            return Boolean(response.rows[0].exists)
        }
        return false
    }

    async saveAthlete(userId: number, athlete: DetailedAthlete) {
        await this.pg.query(
            `
            INSERT INTO athletes (
                id, user_id, resource_state, firstname, lastname, profile_medium,
                profile, city, state, country, sex, premium, summit, created_at,
                updated_at, follower_count, friend_count, measurement_preference,
                ftp, weight
            ) VALUES(
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18,
                $19, $20
            );
        `,
            [
                athlete.id,
                userId,
                athlete.resourceState,
                athlete.firstname,
                athlete.lastname,
                athlete.profileMedium,
                athlete.profile,
                athlete.city,
                athlete.state,
                athlete.country,
                athlete.sex,
                athlete.premium,
                athlete.summit,
                athlete.createdAt,
                athlete.updatedAt,
                athlete.followerCount,
                athlete.friendCount,
                athlete.measurementPreference,
                athlete.ftp,
                athlete.weight,
            ] as QueryConfigValues<(number & string & Date)[]>,
        )
    }

    async retrieveAthlete(token: StravaToken): Promise<DetailedAthlete> {
        const athletesApi = new AthletesApi(
            {
                accessToken: token.getAccessToken(),
            },
            undefined,
            this.axiosClient,
        )
        return (await athletesApi.getLoggedInAthlete()).data
    }

    async getAthleteFromId(athlete_id: number): Promise<Athlete> {
        const response = await this.pg.query(
            `
                SELECT
                    id, user_id, resource_state, firstname, lastname, profile_medium,
                    profile, city, state, country, sex, premium, summit, created_at,
                    updated_at, follower_count, friend_count, measurement_preference,
                    ftp, weight
                FROM athletes WHERE id = $1
                LIMIT 1
            `,
            [athlete_id],
        )
        if (response.rowCount != 1 || response.rows[0] == undefined) {
            throw Error("Athlete not found")
        }

        const athleteData = response.rows[0]

        return {
            id: athleteData["id"],
            user_id: athleteData["user_id"],
            resource_state: athleteData["resource_state"],
            firstname: athleteData["firstname"],
            lastname: athleteData["lastname"],
            profile_medium: athleteData["profile_medium"],
            profile: athleteData["profile"],
            city: athleteData["city"],
            state: athleteData["state"],
            country: athleteData["country"],
            sex: athleteData["sex"],
            premium: Boolean(athleteData["premium"]),
            summit: Boolean(athleteData["summit"]),
            created_at: new Date(athleteData["created_at"]),
            updated_at: new Date(athleteData["updated_at"]),
            follower_count: Number(athleteData["follower_count"]),
            friend_count: Number(athleteData["friend_count"]),
            measurement_preference: athleteData["measurement_preference"],
            ftp: Number(athleteData["ftp"]),
            weight: Number(athleteData["weight"]),
        }
    }

    async getAthlete(userId: number, token: StravaToken): Promise<Athlete> {
        if (!(await this.athleteExists(userId))) {
            const athlete = await this.retrieveAthlete(token)
            await this.saveAthlete(userId, athlete)
        }
        console.log(userId)
        const response = await this.pg.query(
            `
                SELECT
                    id, user_id, resource_state, firstname, lastname, profile_medium,
                    profile, city, state, country, sex, premium, summit, created_at,
                    updated_at, follower_count, friend_count, measurement_preference,
                    ftp, weight
                FROM athletes WHERE user_id = $1
                LIMIT 1
            `,
            [userId] as QueryConfigValues<number[]>,
        )

        console.log(response)
        if (response.rowCount != 1 || response.rows[0] == undefined) {
            throw Error("Athlete not found")
        }

        const athleteData = response.rows[0]

        return {
            id: athleteData["id"],
            user_id: athleteData["user_id"],
            resource_state: athleteData["resource_state"],
            firstname: athleteData["firstname"],
            lastname: athleteData["lastname"],
            profile_medium: athleteData["profile_medium"],
            profile: athleteData["profile"],
            city: athleteData["city"],
            state: athleteData["state"],
            country: athleteData["country"],
            sex: athleteData["sex"],
            premium: Boolean(athleteData["premium"]),
            summit: Boolean(athleteData["summit"]),
            created_at: new Date(athleteData["created_at"]),
            updated_at: new Date(athleteData["updated_at"]),
            follower_count: Number(athleteData["follower_count"]),
            friend_count: Number(athleteData["friend_count"]),
            measurement_preference: athleteData["measurement_preference"],
            ftp: Number(athleteData["ftp"]),
            weight: Number(athleteData["weight"]),
        }
    }
}
