import { useEffect, useState } from "react"
import "./App.css"
import {
    GetAuthenticatedCommand,
    PingCommand,
    RunningClient,
} from "@running/client"
import { NextUIProvider } from "@nextui-org/react"

const client = new RunningClient({
    endpoint: "http://localhost:8080",
    region: "fake-region",
})

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [authenticateUrl, setAuthenticateUrl] = useState<string>("")

    useEffect(() => {
        if (!isAuthenticated) {
            checkAuthenticated()
        }
    }, [isAuthenticated])

    async function ping() {
        const response = await client.send(new PingCommand({}))
        console.log(response)
    }

    async function checkAuthenticated() {
        const response = await client.send(
            new GetAuthenticatedCommand({
                username: "localuser",
            }),
        )
        if (response.isAuthenticated === undefined) {
            return
        }
        setIsAuthenticated(response.isAuthenticated)
        if (
            response.isAuthenticated === false &&
            response.authUrl !== undefined
        ) {
            setAuthenticateUrl(response.authUrl)
        }
    }

    return (
        <NextUIProvider>
            <div className="App">
                <h1>Hello World</h1>
                <p>You are {isAuthenticated ? "" : "not "}authenticated</p>
                <button onClick={ping}>Click to ping</button>
                <button
                    onClick={() => {
                        window.location.href = authenticateUrl
                    }}
                >
                    Click to authenticate
                </button>
            </div>
        </NextUIProvider>
    )
}

export default App
