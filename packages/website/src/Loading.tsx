import { ExchangeTokenCommand, RunningClient } from '@running/client';
import React, { useEffect } from 'react';
import { Credentials } from './credentials';

const endpoint = "http://localhost:8080"
const region = "fake-region"
const runningClient = new RunningClient({ endpoint, region })

export interface LoadingProps {
    setCredentials: Function
}

function Loading(props: LoadingProps) {
    useEffect(() => {
        const url = new URL(window.location.href)
        const exchangeToken = async () => {
            if (!url.searchParams.has('code')) {
                throw Error("No exchange token provided")
            }
            const exchangeToken = url.searchParams.get('code')!
            console.log('exchangeToken is ' + exchangeToken)

            try {
                const response = await runningClient.send(new ExchangeTokenCommand({
                    exchangeToken: exchangeToken
                }))
                console.log(response)
                const credentials = new Credentials(response.accessToken!, response.refreshToken!, response.expiresAt!)
                props.setCredentials(credentials)
                credentials.storeCredentials()
                window.location.href = "/"
            }
            catch (error) {
                console.log(error)
            }
        }

        if (url.pathname === "/exchangeToken") {
            exchangeToken()
        }
    }, [location])

    return (
        <h1>Loading...</h1>
    )
}

export default Loading
