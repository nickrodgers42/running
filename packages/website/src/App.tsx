import React from 'react';
import logo from './logo.svg';
import './App.css';
import { CLIENT_ID } from './constants';

function App() {
  const auth = () => {
    console.log('attempting to authenticate with strava')
    const url = `http://www.strava.com/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=http://localhost:3000/exchangeToken&` +
      `approval_prompt=force&` +
      `scope=read`
    window.open(url)
  }

  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={auth}>Authenticate with Strava</button>
    </div>
  );
}

export default App;
