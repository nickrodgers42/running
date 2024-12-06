import { useEffect, useState } from "react"
import "./App.css"
import {
    AuthenticateCommand,
    IsAuthenticatedCommand,
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
            new IsAuthenticatedCommand({
                username: "localuser",
            }),
        )
        if (response.isAuthenticated === undefined) {
            return
        }
        setIsAuthenticated(response.isAuthenticated)
    }

    async function authenticate() {
        const response = await client.send(
            new AuthenticateCommand({
                username: "localuser"
            })
        )
        if (response.$metadata.httpStatusCode === 200 && response.authUrl) {
            window.location.href = response.authUrl
        }
    }


    return (
        <NextUIProvider>
            <div className="App">
                <h1>Hello World</h1>
                <p>You are {isAuthenticated ? "" : "not "}authenticated</p>
                <button className="button" onClick={ping}>Click to ping the server</button>
                <button
                    className="button"
                    onClick={authenticate}
                >
                    Click to authenticate with Strava
                </button>
            </div>
        </NextUIProvider>
    )
}

export default App
