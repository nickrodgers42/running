import { AxiosInstance } from "axios"
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
import { Pool, QueryConfigValues } from "pg"
import sql from "./database"

type QueryConfig = QueryConfigValues<(number & string & Date)[]>

function getValuesList(params: unknown[]): string {
    return params
        .map((_value: unknown, index) => {
            return `$${index + 1}`
        })
        .join(", ")
}

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
    private pg: Pool
    private axiosClient: AxiosInstance

    constructor(pg: Pool, axiosClient: AxiosInstance) {
        this.pg = pg
        this.axiosClient = axiosClient
    }

    async saveGear(gear: DetailedGear, sqlClient?: typeof sql) {
        const db = sqlClient ?? sql
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

    async hasGear(gearId: string): Promise<boolean> {
        const response = await sql`
            SELECT EXISTS (SELECT id FROM gear WHERE id = ${gearId})
        `
        if (response.length > 0) {
            return Boolean(response[0].exists)
        }
        return false
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

    async segmentExists(segmentId: number): Promise<boolean> {
        const response = await sql`
            SELECT EXISTS (SELECT id FROM segments WHERE id = ${segmentId})
        `
        if (response.length > 0) {
            return Boolean(response[0].exists)
        }
        return false
    }

    async saveSegment(segment: DetailedSegment) {
        await sql`
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
                ${segment.id ?? null},
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
        await sql`
            INSERT INTO segment_efforts (
                id, activity_id, elapsed_time, start_date, start_date_local,
                distance, is_kom, name, activity.id, athlete.id, moving_time, start_index,
                end_index, average_cadence, average_watts, device_watts, average_heartrate,
                max_heartrate, segment_id, kom_rank, pr_rank, hidden
            )
            VALUES (
                ${effort.id ?? null},
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
        `
    }

    async saveLap(lap: Lap) {
        await sql`
            INSERT INTO laps (
                id, activity.id, athlete.id, average_cadence, average_speed,
                distance, elapsed_time, start_index, end_index, lap_index,
                max_speed, moving_time, name, pace_zone, split, start_date,
                start_date_local,  total_elevation_gain
            )
            VALUES (
                ${lap.id ?? null},
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
        `
    }

    async saveActivity(
        userId: number,
        activity: DetailedActivity,
        token: StravaToken,
    ) {
        activity = keysToCamelCase(activity)
        try {
            // Insert gear
            if (activity.gearId && !(await this.hasGear(activity.gearId))) {
                const gear = await this.retrieveGear(token, activity.gearId)
                await this.saveGear(gear)
            }

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
                    ${activity.id ?? null},
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
                    ${activity.uploadId ?? null},
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

            `
        } catch (err) {
            console.log(err)
        }
    }
}
