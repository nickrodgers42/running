$version: "2"
namespace example.running

use aws.protocols#restJson1
use smithy.framework#ValidationException
use aws.api#service

@service(sdkId: "Running")
@restJson1
@cors({})

service Running {
    version: "2023-08-13"
    operations: [
        IsAuthenticated
        Authenticate
        ExchangeToken
        GetAthlete
        Ping
    ]
}

@readonly
@http(method: "GET", "uri": "/isAuthenticated/{username}", code: 200)
operation IsAuthenticated {
    input: IsAuthenticatedInput
    output: IsAuthenticatedOutput
    errors: [ AuthenticationError, ValidationException ]
}

structure IsAuthenticatedInput {
    @required
    @httpLabel
    username: String
}

structure IsAuthenticatedOutput {
    @required
    isAuthenticated: Boolean
}

@readonly
@http(method: "GET", "uri": "/authenticate/{username}", code: 200)
operation Authenticate {
    input: AuthenticationInput
    output: AuthenticationOutput
    errors: [ AuthenticationError, ValidationException ]
}

structure AuthenticationInput {
    @required
    @httpLabel
    username: String
}

structure AuthenticationOutput {
    @required
    authUrl: String
}


@error("server")
@httpError(500)
structure AuthenticationError {
    @required
    message: String
}

@readonly
@http(method: "GET", "uri": "/ping", code: 200)
operation Ping {
    input: PingInput
    output: PingOutput
    errors: [ ValidationException ]
}

@input
structure PingInput { }

@output
structure PingOutput {
    message: String
}

@readonly
@http(method: "GET", "uri": "/exchangeToken/{username}")
operation ExchangeToken {
    input: ExchangeTokenInput
    output: ExchangeTokenOutput
    errors: [ ValidationException ]
}

structure ExchangeTokenInput {
    @httpLabel
    @required
    username: String

    @httpQuery("state")
    @required
    state: String

    @httpQuery("code")
    @required
    code: String

    @httpQuery("scope")
    @required
    scope: Scope
}

list Scope {
    member: String
}

structure ExchangeTokenOutput {
    @httpHeader("Location")
    content: String

    @httpResponseCode
    responseCode: Integer
}

@readonly
@http(method: "GET", "uri": "/getAthlete/{username}", code: 200)
operation GetAthlete {
    input: GetAthleteInput
    output: GetAthleteOutput
    errors: [ GetAthleteError, ValidationException ]
}

structure GetAthleteInput {
    @required
    @httpLabel
    username: String
}

structure GetAthleteOutput {
    athlete: Athlete
}

structure Athlete {
    id: Integer
    user_id: Integer
    resource_state: Integer
    firstname: String
    lastname: String
    profile_medium: String
    profile: String
    city: String
    state: String
    country: String
    sex: String
    premium: Boolean
    summit: Boolean
    created_at: Timestamp
    updated_at: Timestamp
    follower_count: Integer
    friend_count: Integer
    measurement_preference: String
    ftp: Integer
    weight: Double
}

@error("server")
@httpError(500)
structure GetAthleteError {
    @required
    message: String
}
