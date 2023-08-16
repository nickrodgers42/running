import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom'
import { CLIENT_ID } from './constants';

import {
    ExchangeTokenCommand,
  RunningClient
} from "@running/client"

const endpoint = "http://localhost:8080"
const region = "fake-region"
const runningClient = new RunningClient({endpoint, region})

const app = <App />
const router = createBrowserRouter([
  {
    path: "/",
    element: app,
    children: [
      {
        path: "exchange_token",
        element: app,
        loader: async ({ request }) => {
          const url = new URL(request.url)
          const exchangeToken = url.searchParams.get('code')
          console.log('exchangeToken is ' + exchangeToken)

          const response = await runningClient.send(new ExchangeTokenCommand({
            exchangeToken: exchangeToken || "h"
          }))
          console.log(response)
          return new Response(JSON.stringify({ exchange_token: exchangeToken}), {
            status: 200,
            headers: {
              "Content-Type": "application/json; utf-8"
            }
          })
        }
      }
    ]
  }
])

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
