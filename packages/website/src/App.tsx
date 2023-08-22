import React, { useEffect, useState } from 'react';
import './App.css';
import { CLIENT_ID } from './constants';
import { useLocation } from 'react-router-dom';
import {
  ExchangeTokenCommand,
  ExchangeTokenError,
  ExchangeTokenOutput,
  RunningClient
} from "@running/client"
import { Credentials } from './credentials';

const endpoint = "http://localhost:8080"
const region = "fake-region"
const runningClient = new RunningClient({ endpoint, region })

function App() {
  const location = useLocation();
  const [credentials, setCredentials] = useState<Credentials | null>(null)

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
    <div>
      <h1>Hello world</h1>
      <p>Location: {location.pathname}</p>
      <button onClick={auth}>Authenticate with Strava</button>
    </div>
  );
}

export default App;
