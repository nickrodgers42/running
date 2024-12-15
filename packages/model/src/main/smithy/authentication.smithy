$version: "2"
namespace example.running

use aws.protocols#restJson1
use smithy.framework#ValidationException
use aws.api#service

resource Authentication {
    operations: [
        IsAuthenticated
        Authenticate
        ExchangeToken
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

