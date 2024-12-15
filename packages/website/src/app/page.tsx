'use client';
import { PingCommand, RunningClient } from "@running/client";

export default function Home() {
  async function ping() {
    const client = new RunningClient({
      endpoint: "http://localhost:8080",
      region: 'fake-region'
    })

    const response = await client.send(new PingCommand({}))
    console.log(response)
  }

  return (
    <div>
      <button onClick={ping}>Click to ping server</button>
    </div>
  );
}
