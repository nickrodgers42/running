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
        ExchangeToken
    ]
}

@http(method: "POST", "uri": "/exchangeToken", code: 200)
operation ExchangeToken {
    input: ExchangeTokenInput
    output: ExchangeTokenOutput
    errors: [ ValidationException, ExchangeTokenError ]
}

@input
structure ExchangeTokenInput {
    @required
    exchangeToken: String
}

@output
structure ExchangeTokenOutput {
    @required
    accessToken: String

    @required
    refreshToken: String

    @required
    athlete: Athlete

    @required
    expiresAt: Integer

    @required
    expiresIn: Integer
}

structure Athlete {
    @required
    id: Integer
}

@error("server")
@httpError(500)
structure ExchangeTokenError {
    @required
    message: String
}
