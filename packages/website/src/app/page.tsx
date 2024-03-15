'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { GetAuthenticatedCommand, PingCommand, RunningClient } from "@running/client";

const client = new RunningClient({ endpoint: "http://localhost:8080", region: "fake-region" })

const getAuthenticated = async () => {
  const response = await client.send(
    new GetAuthenticatedCommand({
      username: "localuser"
    })
  )
  return response
}

const authenticate = async () => {
  const response = await client.send(
    new GetAuthenticatedCommand({
      username: "localuser"
    })
  )
  console.log(response)
}
const ping = async () => {
  const response = await client.send(
    new PingCommand({})
  )
  console.log(response)
}

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <button onClick={() => ping()}>Click to ping</button>
      <button onClick={() => authenticate()}>Click to authenticate</button>
    </div>
  );
}
