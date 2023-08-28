import React, { useEffect, useState } from 'react'
import { AthletesApi } from 'strava'
import { Credentials } from './credentials'

const User = (props: any) => {
    const [user, setuser] = useState()

    useEffect(() => {
        const client = new AthletesApi()
        console.log(
            client.getLoggedInAthlete(
                {
                    headers: {
                        "Authorization": `Bearer ${props.credentials.getAccessToken()}`
                    }
                }
            ).then(response => { console.log(response) })
        )
    })

    return <h1>Hello</h1>
}

export default User
