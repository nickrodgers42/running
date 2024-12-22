import { AxiosInstance } from "axios"
import { DetailedActivity, DetailedGear, DetailedSegment, DetailedSegmentEffort, GearsApi, Lap, SegmentsApi, SummaryGear } from "strava"
import StravaToken from "../token/stravaToken"
import { Pool, PoolClient, QueryConfigValues } from "pg"

type QueryConfig =  QueryConfigValues<(number & string & Date)[]>

function getValuesList(params: unknown[]): string {
    return params.map((_value: unknown, index) => {
        return `$${index + 1}`
    }).join(', ')
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/* eslint-disable-next-line */
function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  } else if (typeof obj === "object" && obj !== null) {
/* eslint-disable-next-line */
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelCaseKey = toCamelCase(key);
        newObj[camelCaseKey] = keysToCamelCase(obj[key]);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

export default class ActivityDataStore {
    private pg: Pool
    private axiosClient: AxiosInstance

    constructor(pg: Pool, axiosClient: AxiosInstance) {
        this.pg = pg
        this.axiosClient = axiosClient
    }

    async saveGear(gear: DetailedGear, client?: PoolClient) {
        let database = client
        if (database == undefined) {
            database = await this.pg.connect()
        }
        const values = [
                gear.id,
                gear.resourceState,
                gear.primary,
                gear.name,
                gear.distance,
                gear.brandName,
                gear.modelName,
                gear.frameType,
                gear.description
        ] as QueryConfig
        await database.query(
            `
                INSERT INTO gear (
                    id, resource_state, primary_gear, name, distance, brand_name,
                    model_name, frame_type, description
                )
                VALUES (
                    ${getValuesList(values)}
                )
            `,
            values
        )
    }

    async hasGear(gearId: string): Promise<boolean> {
        const response = await this.pg.query(
            `SELECT EXISTS (SELECT id FROM gear WHERE id = $1)`,
            [gearId],
        )
        if (response.rowCount && response.rowCount > 0) {
            return Boolean(response.rows[0].exists)
        }
        return false
    }

    async retrieveGear(token: StravaToken, gearId: string): Promise<DetailedGear> {
        const gearApi = new GearsApi({
            accessToken: token.getAccessToken()
        }, undefined, this.axiosClient)

        return keysToCamelCase((await gearApi.getGearById(gearId)).data)
    }

    async segmentExists(segmentId: number): Promise<boolean> {
        const response = await this.pg.query(
            `SELECT EXISTS (SELECT id FROM segments WHERE id = $1)`,
            [segmentId]
        )
        if (response.rowCount && response.rowCount > 0) {
            return Boolean(response.rows[0].exists)
        }
        return false
    }

    async saveSegment(segment: DetailedSegment) {
        const values = [
                segment.id,
                segment.name,
                segment.activityType,
                segment.distance,
                segment.averageGrade,
                segment.maximumGrade,
                segment.elevationHigh,
                segment.elevationLow,
                segment.climbCategory,
                segment.city,
                segment.state,
                segment.country,
                segment._private,
                segment.athletePrEffort?.prActivityId,
                segment.athletePrEffort?.prElapsedTime,
                segment.athletePrEffort?.prDate,
                segment.athletePrEffort?.effortCount,
                segment.athleteSegmentStats?.id,
                segment.createdAt,
                segment.updatedAt,
                segment.totalElevationGain,
                segment.map?.id,
                segment.map?.polyline,
                segment.map?.summaryPolyline,
                segment.effortCount,
                segment.athleteCount,
                segment.hazardous,
                segment.starCount
            ]
        await this.pg.query(
            `
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
                    ${getValuesList(values)},
                    POINT($${values.length + 1}, $${values.length + 2}),
                    POINT($${values.length + 3}, $${values.length + 4})
                )
            `,
             [
                 ...values,
                 segment.startLatlng ? segment.startLatlng[0] : '',
                 segment.startLatlng ? segment.startLatlng[1] : '',
                 segment.endLatlng ? segment.endLatlng[0] : '',
                 segment.endLatlng ? segment.endLatlng[1] : '',
             ] as QueryConfig
        )
    }

    async saveSegmentEffort(token: StravaToken, effort: DetailedSegmentEffort) {
        if (effort.segment?.id != undefined && !(await this.segmentExists(effort.segment.id))) {
            const segmentApi = new SegmentsApi({
                accessToken: token.getAccessToken()
            }, undefined, this.axiosClient)
            const segment = keysToCamelCase((await segmentApi.getSegmentById(effort.segment.id)).data)
            this.saveSegment(segment)
        }
        await this.pg.query(
            `
                INSERT INTO segment_efforts (
                    id, activity_id, elapsed_time, start_date, start_date_local,
                    distance, is_kom, name, activity.id, athlete.id, moving_time, start_index,
                    end_index, average_cadence, average_watts, device_watts, average_heartrate,
                    max_heartrate, segment_id, kom_rank, pr_rank, hidden
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17,
                    $18, $19, $20, $21, $22
                )
            `,
            [
                effort.id,
                effort.activityId,
                effort.elapsedTime,
                effort.startDate,
                effort.startDateLocal,
                effort.distance,
                effort.isKom,
                effort.name,
                effort.activity?.id,
                effort.athlete?.id,
                effort.movingTime,
                effort.startIndex,
                effort.endIndex,
                effort.averageCadence,
                effort.averageWatts,
                effort.deviceWatts,
                effort.averageHeartrate,
                effort.maxHeartrate,
                effort.segment?.id,
                effort.komRank,
                effort.prRank,
                effort.hidden
            ] as QueryConfig
        )
    }

    async saveLap(lap: Lap) {
        await this.pg.query(
            `
                INSERT INTO laps (
                    id, activity.id, athlete.id, average_cadence, average_speed,
                    distance, elapsed_time, start_index, end_index, lap_index,
                    max_speed, moving_time, name, pace_zone, split, start_date,
                    start_date_local,  total_elevation_gain
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16,
                    $17, $18
                )
            `,
            [
                lap.id,
                lap.activity?.id,
                lap.athlete?.id,
                lap.averageCadence,
                lap.averageSpeed,
                lap.distance,
                lap.elapsedTime,
                lap.startIndex,
                lap.endIndex,
                lap.lapIndex,
                lap.maxSpeed,
                lap.movingTime,
                lap.name,
                lap.paceZone,
                lap.split,
                lap.startDate,
                lap.startDateLocal,
                lap.totalElevationGain
            ] as QueryConfig
        )
    }

    async saveActivity(userId: number, activity: DetailedActivity, token: StravaToken) {
        activity = keysToCamelCase(activity)
        const client = await this.pg.connect();
        await client.query("BEGIN")
        try {

        // Insert gear
        if (activity.gearId && !(await this.hasGear(activity.gearId))) {
            const gear = await this.retrieveGear(token, activity.gearId)
            await this.saveGear(gear)
        }

        // Insert setment efforts
        if (activity.segmentEfforts) {
            activity.segmentEfforts.forEach(async (effort: DetailedSegmentEffort) => {
                await this.saveSegmentEffort(token, effort)
            })
        }

        // insert laps
        if (activity.laps) {
            activity.laps.forEach(async (lap: Lap) => {
                await this.saveLap(lap)
            })
        }
        // insert best efforts
        if (activity.bestEfforts) {
            activity.bestEfforts.forEach(async (effort: DetailedSegmentEffort) => {
                await this.saveSegmentEffort(token, effort)
            })
        }

        const values = [
                activity.id,
                userId,
                activity.externalId,
                activity.uploadId,
                activity.athlete?.id,
                activity.name,
                activity.distance,
                activity.movingTime,
                activity.elapsedTime,
                activity.totalElevationGain,
                activity.elevHigh,
                activity.elevLow,
                activity.type,
                activity.sportType,
                activity.startDate,
                activity.startDateLocal,
                activity.timezone,
                activity.achievementCount,
                activity.kudosCount,
                activity.commentCount,
                activity.athleteCount,
                activity.photoCount,
                activity.totalPhotoCount,
                activity.map?.id,
                activity.map?.polyline,
                activity.map?.summaryPolyline,
                activity.trainer,
                activity.commute,
                activity.manual,
                activity._private,
                activity.flagged,
                activity.workoutType,
                activity.uploadId,
                activity.averageSpeed,
                activity.maxSpeed,
                activity.hasKudoed,
                activity.hideFromHome,
                activity.gear?.id,
                activity.kilojoules,
                activity.averageWatts,
                activity.deviceWatts,
                activity.maxWatts,
                activity.weightedAverageWatts,
                activity.description,
                activity.photos?.count,
                activity.photos?.primary?.id,
                activity.photos?.primary?.source,
                activity.photos?.primary?.uniqueId,
                activity.photos?.primary?.urls,
                activity.calories,
                activity.deviceName,
                activity.embedToken,
        ]
        await this.pg.query(
            `
                INSERT INTO activities (
                    id, user_id, external_id, upload_id, athlete.id, name, distance,
                    moving_time, elapsed_time, total_elevation_gain, elev_high,
                    elev_low, type, sport_type, start_date, start_date_local,
                    timezone,
                    achievement_count,
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
                ) VALUES (
                    ${getValuesList(values)},
                    POINT($${values.length + 1}, $${values.length + 2}),
                    POINT($${values.length + 3}, $${values.length + 4})
                )
            `,
            [
                ...values,
                activity.startLatlng ? activity.startLatlng[0] : '',
                activity.startLatlng ? activity.startLatlng[1] : '',
                activity.endLatlng ? activity.endLatlng[0] : '',
                activity.endLatlng ? activity.endLatlng[1] : '',
            ] as QueryConfig
        )
        await client.query("COMMIT")
        } catch(err) {
            console.log(err)
            await client.query("ROLLBACK")
        }
    }
}
