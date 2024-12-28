$version: "2"
namespace example.running

use aws.protocols#restJson1
use smithy.framework#ValidationException
use aws.api#service

@service(sdkId: "Running")
@restJson1
@cors({})
@httpBasicAuth
@auth([httpBasicAuth])
service Running {
    version: "2023-08-13"
    operations: [
        Login
        Ping
    ]
    resources: [
        Authentication
        Athletes
        Activities
        User
    ]
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

@error("client")
@httpError(401)
structure AuthorizationError {
    message: String
}
