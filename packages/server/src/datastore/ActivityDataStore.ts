import axios, { AxiosInstance } from "axios"
import {
    DetailedActivity,
    DetailedGear,
    DetailedSegment,
    DetailedSegmentEffort,
    GearsApi,
    Lap,
    SegmentsApi,
} from "strava"
import StravaToken from "../token/stravaToken"
import sql from "./database"
import { Activity } from "@running/server"

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/* eslint-disable-next-line */
function keysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(keysToCamelCase)
    } else if (typeof obj === "object" && obj !== null) {
        /* eslint-disable-next-line */
        const newObj: any = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelCaseKey = toCamelCase(key)
                newObj[camelCaseKey] = keysToCamelCase(obj[key])
            }
        }
        return newObj
    } else {
        return obj
    }
}

export default class ActivityDataStore {
    private dbClient: typeof sql
    private axiosClient: AxiosInstance

    constructor(dbClient?: typeof sql, axiosClient?: AxiosInstance) {
        this.dbClient = dbClient ?? sql
        this.axiosClient = axiosClient ?? axios.create()
    }

    async retrieveGear(
        token: StravaToken,
        gearId: string,
    ): Promise<DetailedGear> {
        const gearApi = new GearsApi(
            {
                accessToken: token.getAccessToken(),
            },
            undefined,
            this.axiosClient,
        )

        return keysToCamelCase((await gearApi.getGearById(gearId)).data)
    }

    async segmentExists(
        segmentId: number,
        dbClient?: typeof sql,
    ): Promise<boolean> {
        const db = dbClient ?? this.dbClient
        const response = await db`
            SELECT EXISTS (SELECT id FROM segments WHERE id = ${segmentId})
        `
        if (response.length > 0) {
            return Boolean(response[0].exists)
        }
        return false
    }

    async saveSegment(segment: DetailedSegment, dbClient?: typeof sql) {
        if (segment.id == undefined) {
            throw Error('segment id must not be undefined')
        }
        const db = dbClient ?? this.dbClient
        await db`
            INSERT INTO segments(
                id, name, activity_type, distance, average_grade, maximum_grade,
                elevation_high, elevation_low,
                climb_category, city, state, country, private,

                athlete_pr_effort.pr_activity_id,
                athlete_pr_effort.pr_elapsed_time,
                athlete_pr_effort.pr_date,
                athlete_pr_effort.effort_count,

                athlete_segment_stats_id,
                created_at, updated_at, total_elevation_gain,

                map.id,
                map.polyline,
                map.summary_polyline,

                effort_count, athlete_count, hazardous, star_count,
                start_latlng,
                end_latlng
            )
            VALUES (
                ${segment.id},
                ${segment.name ?? null},
                ${segment.activityType ?? null},
                ${segment.distance ?? null},
                ${segment.averageGrade ?? null},
                ${segment.maximumGrade ?? null},
                ${segment.elevationHigh ?? null},
                ${segment.elevationLow ?? null},
                ${segment.climbCategory ?? null},
                ${segment.city ?? null},
                ${segment.state ?? null},
                ${segment.country ?? null},
                ${segment._private ?? null},

                ${segment.athletePrEffort?.prActivityId ?? null},
                ${segment.athletePrEffort?.prElapsedTime ?? null},
                ${segment.athletePrEffort?.prDate ?? null},
                ${segment.athletePrEffort?.effortCount ?? null},

                ${segment.athleteSegmentStats?.id ?? null},
                ${segment.createdAt ?? null},
                ${segment.updatedAt ?? null},
                ${segment.totalElevationGain ?? null},

                ${segment.map?.id ?? null},
                ${segment.map?.polyline ?? null},
                ${segment.map?.summaryPolyline ?? null},

                ${segment.effortCount ?? null},
                ${segment.athleteCount ?? null},
                ${segment.hazardous ?? null},
                ${segment.starCount ?? null},

                POINT(${segment.startLatlng?.at(0) ?? null}, ${segment.startLatlng?.at(1) ?? null}),
                POINT(${segment.endLatlng?.at(0) ?? null}, ${segment.endLatlng?.at(1) ?? null})
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
                name = ${segment.name ?? null},
                activity_type = ${segment.activityType ?? null},
                distance = ${segment.distance ?? null},
                average_grade = ${segment.averageGrade ?? null},
                maximum_grade = ${segment.maximumGrade ?? null},
                elevation_high = ${segment.elevationHigh ?? null},
                elevation_low = ${segment.elevationLow ?? null},
                climb_category = ${segment.climbCategory ?? null},
                city = ${segment.city ?? null},
                state = ${segment.state ?? null},
                country = ${segment.country ?? null},
                private = ${segment._private ?? null},

                athlete_pr_effort.pr_activity_id  = ${segment.athletePrEffort?.prActivityId ?? null},
                athlete_pr_effort.pr_elapsed_time = ${segment.athletePrEffort?.prElapsedTime ?? null},
                athlete_pr_effort.pr_date = ${segment.athletePrEffort?.prDate ?? null},
                athlete_pr_effort.effort_count = ${segment.athletePrEffort?.effortCount ?? null},

                athlete_segment_stats_id = ${segment.athleteSegmentStats?.id ?? null},
                created_at = ${segment.createdAt ?? null},
                updated_at = ${segment.updatedAt ?? null},
                total_elevation_gain = ${segment.totalElevationGain ?? null},

                map.id = ${segment.map?.id ?? null},
                map.polyline = ${segment.map?.polyline ?? null},
                map.summary_polyline = ${segment.map?.summaryPolyline ?? null},

                effort_count = ${segment.effortCount ?? null},
                athlete_count = ${segment.athleteCount ?? null},
                hazardous = ${segment.hazardous ?? null},
                star_count = ${segment.starCount ?? null},

                start_latlng = POINT(${segment.startLatlng?.at(0) ?? null}, ${segment.startLatlng?.at(1) ?? null}),
                end_latlng = POINT(${segment.endLatlng?.at(0) ?? null}, ${segment.endLatlng?.at(1) ?? null})
        `
    }

    async saveSegmentEffort(token: StravaToken, effort: DetailedSegmentEffort) {
        if (
            effort.segment?.id != undefined &&
            !(await this.segmentExists(effort.segment.id))
        ) {
            const segmentApi = new SegmentsApi(
                {
                    accessToken: token.getAccessToken(),
                },
                undefined,
                this.axiosClient,
            )
            const segment = keysToCamelCase(
                (await segmentApi.getSegmentById(effort.segment.id)).data,
            )
            this.saveSegment(segment)
        }
        if (effort.id == undefined) {
            throw Error("Effort id must be defined")
        }
        await sql`
            INSERT INTO segment_efforts (
                id, activity_id, elapsed_time, start_date, start_date_local,
                distance, is_kom, name, activity.id, athlete.id, moving_time, start_index,
                end_index, average_cadence, average_watts, device_watts, average_heartrate,
                max_heartrate, segment_id, kom_rank, pr_rank, hidden
            )
            VALUES (
                ${effort.id},
                ${effort.activityId ?? null},
                ${effort.elapsedTime ?? null},
                ${effort.startDate ?? null},
                ${effort.startDateLocal ?? null},
                ${effort.distance ?? null},
                ${effort.isKom ?? null},
                ${effort.name ?? null},
                ${effort.activity?.id ?? null},
                ${effort.athlete?.id ?? null},
                ${effort.movingTime ?? null},
                ${effort.startIndex ?? null},
                ${effort.endIndex ?? null},
                ${effort.averageCadence ?? null},
                ${effort.averageWatts ?? null},
                ${effort.deviceWatts ?? null},
                ${effort.averageHeartrate ?? null},
                ${effort.maxHeartrate ?? null},
                ${effort.segment?.id ?? null},
                ${effort.komRank ?? null},
                ${effort.prRank ?? null},
                ${effort.hidden ?? null}
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
                activity_id = ${effort.activityId ?? null},
                elapsed_time = ${effort.elapsedTime ?? null},
                start_date = ${effort.startDate ?? null},
                start_date_local = ${effort.startDateLocal ?? null},
                distance = ${effort.distance ?? null},
                is_kom = ${effort.isKom ?? null},
                name = ${effort.name ?? null},
                activity.id = ${effort.activity?.id ?? null},
                athlete.id = ${effort.athlete?.id ?? null},
                moving_time = ${effort.movingTime ?? null},
                start_index = ${effort.startIndex ?? null},
                end_index = ${effort.endIndex ?? null},
                average_cadence = ${effort.averageCadence ?? null},
                average_watts = ${effort.averageWatts ?? null},
                device_watts = ${effort.deviceWatts ?? null},
                average_heartrate = ${effort.averageHeartrate ?? null},
                max_heartrate = ${effort.maxHeartrate ?? null},
                segment_id = ${effort.segment?.id ?? null},
                kom_rank = ${effort.komRank ?? null},
                pr_rank = ${effort.prRank ?? null},
                hidden = ${effort.hidden ?? null}
        `
    }

    async saveLap(lap: Lap) {
        if (lap.id == undefined) {
            throw Error("Lap id must not be undefined")
        }
        await sql`
            INSERT INTO laps (
                id, activity.id, athlete.id, average_cadence, average_speed,
                distance, elapsed_time, start_index, end_index, lap_index,
                max_speed, moving_time, name, pace_zone, split, start_date,
                start_date_local,  total_elevation_gain
            )
            VALUES (
                ${lap.id},
                ${lap.activity?.id ?? null},
                ${lap.athlete?.id ?? null},
                ${lap.averageCadence ?? null},
                ${lap.averageSpeed ?? null},
                ${lap.distance ?? null},
                ${lap.elapsedTime ?? null},
                ${lap.startIndex ?? null},
                ${lap.endIndex ?? null},
                ${lap.lapIndex ?? null},
                ${lap.maxSpeed ?? null},
                ${lap.movingTime ?? null},
                ${lap.name ?? null},
                ${lap.paceZone ?? null},
                ${lap.split ?? null},
                ${lap.startDate ?? null},
                ${lap.startDateLocal ?? null},
                ${lap.totalElevationGain ?? null}
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
                activity.id = ${lap.activity?.id ?? null},
                athlete.id = ${lap.athlete?.id ?? null},
                average_cadence = ${lap.averageCadence ?? null},
                average_speed = ${lap.averageSpeed ?? null},
                distance = ${lap.distance ?? null},
                elapsed_time = ${lap.elapsedTime ?? null},
                start_index = ${lap.startIndex ?? null},
                end_index = ${lap.endIndex ?? null},
                lap_index = ${lap.lapIndex ?? null},
                max_speed = ${lap.maxSpeed ?? null},
                moving_time = ${lap.movingTime ?? null},
                name = ${lap.name ?? null},
                pace_zone = ${lap.paceZone ?? null},
                split = ${lap.split ?? null},
                start_date = ${lap.startDate ?? null},
                start_date_local = ${lap.startDateLocal ?? null},
                total_elevation_gain = ${lap.totalElevationGain ?? null}
        `
    }

    async activityExists(activityId: string): Promise<boolean> {
        const response = await sql`
            SELECT EXISTS (
                SELECT id
                FROM activities
                WHERE id = ${activityId}
            )
        `
        if (response.length > 0) {
            return Boolean(response[0].exists)
        }
        return false
    }

    async getActivity(
        activityId: string,
        dbClient?: typeof sql,
    ): Promise<Activity> {
        const db = dbClient ?? this.dbClient
        const response = await db`
            SELECT
                id, user_id, external_id, upload_id, athlete.id, name, distance,
                moving_time, elapsed_time, total_elevation_gain, elev_high,
                elev_low, type, sport_type, start_date, start_date_local,
                timezone, achievement_count,
                kudos_count, comment_count, athlete_count, photo_count,
                total_photo_count,
                map,
                trainer, commute, manual, private,
                flagged, workout_type, upload_id_str, average_speed, max_speed,
                has_kudoed, hide_from_home, gear_id, kilojoules, average_watts,
                device_watts, max_watts, weighted_average_watts, description,
                photos,
                calories, device_name, embed_token,
                start_latlng,
                end_latlng
            FROM activities
            WHERE id = ${activityId}
            LIMIT 1
        `
        if (response.length == 0) {
            throw Error(`No activity with id ${activityId} found`)
        }
        return response[0] as Activity
    }

    async listActivities(
        before?: Date,
        after?: Date,
        page?: number,
        perPage?: number,
        dbClient?: typeof sql
    ) {
        const db = dbClient ?? this.dbClient
        const dbResponse = await db<Activity[]>`
            SELECT * FROM activities
        `
        return dbResponse
    }

    async saveActivity(
        userId: number,
        activity: DetailedActivity,
        token: StravaToken,
    ) {
        if (activity.id == undefined) {
            throw Error("Activity id must not be undefined")
        }
        try {
            // Insert setment efforts
            if (activity.segmentEfforts) {
                activity.segmentEfforts.forEach(
                    async (effort: DetailedSegmentEffort) => {
                        await this.saveSegmentEffort(token, effort)
                    },
                )
            }

            // insert laps
            if (activity.laps) {
                activity.laps.forEach(async (lap: Lap) => {
                    await this.saveLap(lap)
                })
            }

            // insert best efforts
            if (activity.bestEfforts) {
                activity.bestEfforts.forEach(
                    async (effort: DetailedSegmentEffort) => {
                        await this.saveSegmentEffort(token, effort)
                    },
                )
            }

            await sql`
                INSERT INTO activities (
                    id, user_id, external_id, upload_id, athlete.id, name, distance,
                    moving_time, elapsed_time, total_elevation_gain, elev_high,
                    elev_low, type, sport_type, start_date, start_date_local,
                    timezone, achievement_count,
                    kudos_count, comment_count, athlete_count, photo_count,
                    total_photo_count,

                    map.id,
                    map.polyline,
                    map.summary_polyline,

                    trainer, commute, manual, private,
                    flagged, workout_type, upload_id_str, average_speed, max_speed,
                    has_kudoed, hide_from_home, gear_id, kilojoules, average_watts,
                    device_watts, max_watts, weighted_average_watts, description,

                    photos.count,
                    photos.photo_primary.id,
                    photos.photo_primary.source,
                    photos.photo_primary.unique_id,
                    photos.photo_primary.urls,

                    calories, device_name, embed_token,

                    start_latlng,
                    end_latlng
                )
                VALUES (
                    ${activity.id},
                    ${userId ?? null},
                    ${activity.externalId ?? null},
                    ${activity.uploadId ?? null},
                    ${activity.athlete?.id ?? null},
                    ${activity.name ?? null},
                    ${activity.distance ?? null},
                    ${activity.movingTime ?? null},
                    ${activity.elapsedTime ?? null},
                    ${activity.totalElevationGain ?? null},
                    ${activity.elevHigh ?? null},
                    ${activity.elevLow ?? null},
                    ${activity.type ?? null},
                    ${activity.sportType ?? null},
                    ${activity.startDate ?? null},
                    ${activity.startDateLocal ?? null},
                    ${activity.timezone ?? null},
                    ${activity.achievementCount ?? null},
                    ${activity.kudosCount ?? null},
                    ${activity.commentCount ?? null},
                    ${activity.athleteCount ?? null},
                    ${activity.photoCount ?? null},
                    ${activity.totalPhotoCount ?? null},

                    ${activity.map?.id ?? null},
                    ${activity.map?.polyline ?? null},
                    ${activity.map?.summaryPolyline ?? null},

                    ${activity.trainer ?? null},
                    ${activity.commute ?? null},
                    ${activity.manual ?? null},
                    ${activity._private ?? null},
                    ${activity.flagged ?? null},
                    ${activity.workoutType ?? null},
                    ${activity.uploadIdStr ?? null},
                    ${activity.averageSpeed ?? null},
                    ${activity.maxSpeed ?? null},
                    ${activity.hasKudoed ?? null},
                    ${activity.hideFromHome ?? null},
                    ${activity.gear?.id ?? null},
                    ${activity.kilojoules ?? null},
                    ${activity.averageWatts ?? null},
                    ${activity.deviceWatts ?? null},
                    ${activity.maxWatts ?? null},
                    ${activity.weightedAverageWatts ?? null},
                    ${activity.description ?? null},

                    ${activity.photos?.count ?? null},
                    ${activity.photos?.primary?.id ?? null},
                    ${activity.photos?.primary?.source ?? null},
                    ${activity.photos?.primary?.uniqueId ?? null},
                    ${JSON.stringify(activity.photos?.primary?.urls)},

                    ${activity.calories ?? null},
                    ${activity.deviceName ?? null},
                    ${activity.embedToken ?? null},

                    POINT(${activity.startLatlng?.at(0) ?? null}, ${activity.startLatlng?.at(1) ?? null}),
                    POINT(${activity.endLatlng?.at(0) ?? null}, ${activity.endLatlng?.at(1) ?? null})
                )
                ON CONFLICT (id)
                DO UPDATE
                SET
                    id = ${activity.id},
                    user_id = ${userId ?? null},
                    external_id = ${activity.externalId ?? null},
                    upload_id =${activity.uploadId ?? null},
                    athlete.id = ${activity.athlete?.id ?? null},
                    name = ${activity.name ?? null},
                    distance = ${activity.distance ?? null},
                    moving_time = ${activity.movingTime ?? null},
                    elapsed_time = ${activity.elapsedTime ?? null},
                    total_elevation_gain = ${activity.totalElevationGain ?? null},
                    elev_high = ${activity.elevHigh ?? null},
                    elev_low = ${activity.elevLow ?? null},
                    type = ${activity.type ?? null},
                    sport_type = ${activity.sportType ?? null},
                    start_date = ${activity.startDate ?? null},
                    start_date_local = ${activity.startDateLocal ?? null},
                    timezone = ${activity.timezone ?? null},
                    achievement_count = ${activity.achievementCount ?? null},
                    kudos_count = ${activity.kudosCount ?? null},
                    comment_count = ${activity.commentCount ?? null},
                    athlete_count = ${activity.athleteCount ?? null},
                    photo_count = ${activity.photoCount ?? null},
                    total_photo_count = ${activity.totalPhotoCount ?? null},

                    map.id = ${activity.map?.id ?? null},
                    map.polyline = ${activity.map?.polyline ?? null},
                    map.summary_polyline = ${activity.map?.summaryPolyline ?? null},

                    trainer = ${activity.trainer ?? null},
                    commute = ${activity.commute ?? null},
                    manual = ${activity.manual ?? null},
                    private = ${activity._private ?? null},
                    flagged = ${activity.flagged ?? null},
                    workout_type = ${activity.workoutType ?? null},
                    upload_id_str = ${activity.uploadIdStr ?? null},
                    average_speed = ${activity.averageSpeed ?? null},
                    max_speed = ${activity.maxSpeed ?? null},
                    has_kudoed = ${activity.hasKudoed ?? null},
                    hide_from_home = ${activity.hideFromHome ?? null},
                    gear_id = ${activity.gear?.id ?? null},
                    kilojoules = ${activity.kilojoules ?? null},
                    average_watts = ${activity.averageWatts ?? null},
                    device_watts = ${activity.deviceWatts ?? null},
                    max_watts = ${activity.maxWatts ?? null},
                    weighted_average_watts = ${activity.weightedAverageWatts ?? null},
                    description = ${activity.description ?? null},

                    photos.count = ${activity.photos?.count ?? null},
                    photos.photo_primary.id = ${activity.photos?.primary?.id ?? null},
                    photos.photo_primary.source = ${activity.photos?.primary?.source ?? null},
                    photos.photo_primary.unique_id = ${activity.photos?.primary?.uniqueId ?? null},
                    photos.photo_primary.urls = ${JSON.stringify(activity.photos?.primary?.urls)},

                    calories = ${activity.calories ?? null},
                    device_name = ${activity.deviceName ?? null},
                    embed_token = ${activity.embedToken ?? null},

                    start_latlng = POINT(${activity.startLatlng?.at(0) ?? null}, ${activity.startLatlng?.at(1) ?? null}),
                    end_latlng = POINT(${activity.endLatlng?.at(0) ?? null}, ${activity.endLatlng?.at(1) ?? null})
            `
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}
