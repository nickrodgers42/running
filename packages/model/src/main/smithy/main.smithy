$version: "2"
namespace example.running

use aws.protocols#restJson1
use smithy.framework#ValidationException
use aws.api#service

@service(sdkId: "Running")
@restJson1
@cors({
    additionalAllowedHeaders: [
        "amz-sdk-invocation-id"
    ]
})

service Running {
    version: "2023-08-13"
    operations: [
        GetAuthenticated
        ExchangeToken
        Ping
    ]
}

@readonly
@http(method: "GET", "uri": "/stravaAuthenticated/{username}", code: 200)
operation GetAuthenticated {
    input: GetAuthenticatedInput
    output: GetAuthenticatedOutput
    errors: [ GetAuthenticatedError, ValidationException ]
}

structure GetAuthenticatedInput {
    @required
    @httpLabel
    username: String
}

structure GetAuthenticatedOutput {
    @required
    isAuthenticated: Boolean

    authUrl: String
}

@error("server")
@httpError(500)
structure GetAuthenticatedError {
    @required
    message: String
}

structure AuthUrl {
    url: String
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
@http(method: "GET", "uri": "/exchangeToken")
operation ExchangeToken {
    input: ExchangeTokenInput
    output: ExchangeTokenOutput
    errors: [ ValidationException ]
}

structure ExchangeTokenInput {
    @httpQuery("state")
    state: String
    @httpQuery("code")
    code: String
    @httpQuery("scope")
    scope: Scope
}

list Scope {
    member: String
}

structure ExchangeTokenOutput {
    @httpPayload
    content: String
}
