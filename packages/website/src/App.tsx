import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { GetAuthenticatedCommand, PingCommand, RunningClient } from "@running/client";

const client = new RunningClient({
  endpoint: "http://localhost:8080",
  region: "fake-region",
});

function App() {
  async function ping() {
    const response = await client.send(new PingCommand({}));
    console.log(response);
  }

  async function authenticate() {
    const response = await client.send(
      new GetAuthenticatedCommand({
        username: "localuser",
      }),
    );
    console.log(response)
  }
  return (
    <div className="App">
      <h1>Hello World</h1>
      <button
        onClick={() => {
          ping();
        }}
      >
        Click to ping
      </button>
      <button onClick={() => { authenticate() }}>Click to authenticate</button>
    </div>
  );
}

export default App;
