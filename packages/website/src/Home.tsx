import React, { useEffect, useState } from 'react'
import { ExchangeTokenCommand, RunningClient } from '@running/client'
import { useLocation } from 'react-router-dom'
import { Credentials } from './credentials'
import { CLIENT_ID } from './constants'
import User from './User'

const endpoint = "http://localhost:8080"
const region = "fake-region"
const runningClient = new RunningClient({ endpoint, region })

const Home = () => {
  const location = useLocation();
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [loading, setLoading] = useState(false)

  const auth = () => {
    console.log('attempting to authenticate with strava')
    const url = `http://www.strava.com/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=http://localhost:3000/exchangeToken&` +
      `approval_prompt=force&` +
      `scope=read`
    window.location.href = url
  }

  useEffect(() => {
    try {
      console.log("Attempting to load stored credentials")
      const storedCredentials = Credentials.getCredentials()
      if (storedCredentials !== null) {
        console.log("stored credentials found")
        setCredentials(storedCredentials)
        console.log(credentials)
      }
    } catch (error) {
      console.log("stored credentials not found")
      return
    }
  }, [])

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
        setCredentials(credentials)
        credentials.storeCredentials()
        window.location.href = "/"
      }
      catch (error) {
        console.log(error)
      }
    }

    if (url.pathname === "/exchangeToken") {
      setLoading(true)
      exchangeToken()
    }
 }, [location])

  return loading ? <h1>Loading...</h1> :
    <div>
      <h1>Hello world</h1>
      <p>Location: {location.pathname}</p>
      <button onClick={auth}>Authenticate with Strava</button>
      { credentials != null ? <User credentials={credentials} /> : <div /> }
    </div>
}

export default Home
