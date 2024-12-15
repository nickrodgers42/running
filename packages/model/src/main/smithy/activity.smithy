$version: "2"
namespace example.running

use aws.protocols#restJson1
use smithy.framework#ValidationException
use aws.api#service

structure Point {
    x: Integer
    y: Integer
}

enum ActivityType {
    ALPINE_SKI = "AlpineSki"
    BACKCOUNTRY_SKI = "BackcountrySki"
    CANOEING = "Canoeing"
    CROSSFIT = "Crossfit"
    EBIKE_RIDE = "EBikeRide"
    ELLIPTICAL = "Elliptical"
    GOLF = "Golf"
    HANDCYCLE = "Handcycle"
    HIKE = "Hike"
    ICE_SKATE = "IceSkate"
    INLINE_SKATE = "InlineSkate"
    KAYAKING = "Kayaking"
    KITESURF = "Kitesurf"
    NORDIC_SKI = "NordicSki"
    RIDE = "Ride"
    ROCK_CLIMBING = "RockClimbing"
    ROLLER_SKI = "RollerSki"
    ROWING = "Rowing"
    RUN = "Run"
    SAIL = "Sail"
    SKATEBOARD = "Skateboard"
    SNOWBOARD = "Snowboard"
    SNOWSHOE = "Snowshoe"
    SOCCER = "Soccer"
    STAIR_STEPPER = "StairStepper"
    STAND_UP_PADDLING = "StandUpPaddling"
    SURFING = "Surfing"
    SWIM = "Swim"
    VELOMOBILE = "Velomobile"
    VIRTUAL_RIDE = "VirtualRide"
    VIRTUAL_RUN = "VirtualRun"
    WALK = "Walk"
    WEIGHT_TRAINING = "WeightTraining"
    WHEELCHAIR = "Wheelchair"
    WINDSURF = "Windsurf"
    WORKOUT = "Workout"
    YOGA = "Yoga"
}

enum Sport {
    ALPINE_SKI = "AlpineSki"
    BACKCOUNTRY_SKI = "BackcountrySki"
    BADMINTON = "Badminton"
    CANOEING = "Canoeing"
    CROSSFIT = "Crossfit"
    EBIKE_RIDE = "EBikeRide"
    ELLIPTICAL = "Elliptical"
    EMOUNTAIN_BIKE_RIDE = "EMountainBikeRide"
    GOLF = "Golf"
    GRAVEL_RIDE = "GravelRide"
    HANDCYCLE = "Handcycle"
    HIGH_INTENSITY_INTERVAL_TRAINING = "HighIntensityIntervalTraining"
    HIKE = "Hike"
    ICE_SKATE = "IceSkate"
    INLINE_SKATE = "InlineSkate"
    KAYAKING = "Kayaking"
    KITESURF = "Kitesurf"
    MOUNTAIN_BIKE_RIDE = "MountainBikeRide"
    NORDIC_SKI = "NordicSki"
    PICKLEBALL = "Pickleball"
    PILATES = "Pilates"
    RACQUETBALL = "Racquetball"
    RIDE = "Ride"
    ROCK_CLIMBING = "RockClimbing"
    ROLLER_SKI = "RollerSki"
    ROWING = "Rowing"
    RUN = "Run"
    SAIL = "Sail"
    SKATEBOARD = "Skateboard"
    SNOWBOARD = "Snowboard"
    SNOWSHOE = "Snowshoe"
    SOCCER = "Soccer"
    SQUASH = "Squash"
    STAIR_STEPPER = "StairStepper"
    STAND_UP_PADDLING = "StandUpPaddling"
    SURFING = "Surfing"
    SWIM = "Swim"
    TABLE_TENNIS = "TableTennis"
    TENNIS = "Tennis"
    TRAIL_RUN = "TrailRun"
    VELOMOBILE = "Velomobile"
    VIRTUAL_RIDE = "VirtualRide"
    VIRTUAL_ROW = "VirtualRow"
    VIRTUAL_RUN = "VirtualRun"
    WALK = "Walk"
    WEIGHT_TRAINING = "WeightTraining"
    WHEELCHAIR = "Wheelchair"
    WINDSURF = "Windsurf"
    WORKOUT = "Workout"
    YOGA = "Yoga"

}

structure PolylineMap {
    id: String
    polyline: String
    summary_poyline: String
}

structure PhotosSummaryPrimary {
    id: String
    source: Integer
    unique_id: String
    urls: String
}

structure PhotosSummary {
    count: Integer
    photo_primary: PhotosSummaryPrimary
}

list StringList {
    member: String
}

structure Split {
    average_speed: Double
    distance: Double
    elapsed_time: Integer
    elevation_difference: Double
    pace_zone: Integer
    moving_time: Integer
    split: Integer
}

list SplitList {
    member: Split
}

resource Activity {
    identifiers: {
        id: ActivityId
    }
    properties: {
        user_id: String
        external_id: String
        upload_id: String
        athlete: String
        name: String
        distance: Double
        moving_time: Integer
        elapsed_time: Integer
        total_elevation_gain: Double
        elev_high: Double
        elev_low: Double
        type: ActivityType
        sport_type: Sport
        start_date: Timestamp
        start_date_local: Timestamp
        timezone: String
        start_latlng: Point
        end_latlng: Point
        achievement_count: Integer
        kudos_count: Integer
        comment_count: Integer
        athlete_count: Integer
        photo_count: Integer
        total_photo_count: Integer
        map: PolylineMap
        trainer: Boolean
        commute: Boolean
        manual: Boolean
        private: Boolean
        flagged: Boolean
        workout_type: Integer
        upload_id_str: String
        average_speed: Double
        max_speed: Double
        has_kudoed: Boolean
        hide_from_home: Boolean
        gear_id: String
        kilojoules: Double
        average_watts: Double
        device_watts: Boolean
        max_watts: Integer
        weighted_average_watts: Integer
        description: String
        photos: PhotosSummary
        gear: String
        calories: Double
        segment_efforts: StringList
        device_name: String
        embed_token: String
        splits_metric: SplitList
        splits_standard: SplitList
        laps: StringList
        best_efforts: StringList
    }
    read: GetActivity
    list: ListActivities
    collectionOperations: [
        SyncActivities
    ]
}

string ActivityId

@readonly
@paginated(inputToken: "nextToken" outputToken: "nextToken")
@http(method: "GET" "uri": "/activities/list", code: 200)
operation ListActivities {
    input: ListActivitiesInput
    output: ListActivitiesOutput
    errors: [ ActivityError, ValidationException ]
}

structure ListActivitiesInput {
    @required
    @httpQuery("username")
    username: String
    @httpQuery("nextToken")
    nextToken: String
    @httpQuery("maxResults")
    maxResults: Integer
}

structure ListActivitiesOutput {
    @required
    activities: ActivityList
    nextToken: String
}

@error("server")
@httpError(500)
structure ActivityError {
    @required
    message: String
}

list ActivityList {
    member: ActivityListMember
}

structure ActivityListMember for Activity {
    $id
    $name
}

@readonly
@http(method: "GET" "uri": "/activities", code: 200)
operation GetActivity {
    input: GetActivityInput
    output: GetActivityOutput
    errors: [ ActivityError ValidationException ]
}

structure GetActivityInput for Activity {
    @required
    @httpQuery("id")
    $id
}

structure GetActivityOutput for Activity {
    @required
    $id
    $user_id
    $external_id
    $upload_id
    $athlete
    $name
    $distance
    $moving_time
    $elapsed_time
    $total_elevation_gain
    $elev_high
    $elev_low
    $type
    $sport_type
    $start_date
    $start_date_local
    $timezone
    $start_latlng
    $end_latlng
    $achievement_count
    $kudos_count
    $comment_count
    $athlete_count
    $photo_count
    $total_photo_count
    $map
    $trainer
    $commute
    $manual
    $private
    $flagged
    $workout_type
    $upload_id_str
    $average_speed
    $max_speed
    $has_kudoed
    $hide_from_home
    $gear_id
    $kilojoules
    $average_watts
    $device_watts
    $max_watts
    $weighted_average_watts
    $description
    $photos
    $gear
    $calories
    $segment_efforts
    $device_name
    $embed_token
    $splits_metric
    $splits_standard
    $laps
    $best_efforts
}

@readonly
@http(method: "GET" "uri": "/activities/sync", code: 200)
operation SyncActivities {
    input: SyncActivitiesInput
    output: SyncActivitiesOutput
    errors: [ ActivityError ValidationException ]
}

structure SyncActivitiesInput {
    @required
    @httpQuery("username")
    username: String
}

structure SyncActivitiesOutput {
}
