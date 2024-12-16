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
        Ping
    ]
    resources: [
        Authentication
        Athletes
        Activities
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

