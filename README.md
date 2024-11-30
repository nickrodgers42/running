# Running

This is an app I'm working on to play with my running data from Strava.
Currently its in pretty rough shape but we're working on it

## Project Structure

### Website

This is the main UI for the app

### Server

A backend server to exchange tokens with the Strava API

### Model

A Smithy model to define the API between the website and the Server


## Development

To build run `docker compose up`

To watch run `docker compose watch`

### Configuring the environment

To run this package you need a .env file at the project root with the following
fields:

```
POSTGRES_PASSWORD=
POSTGRES_USER=localuser
POSTGRES_HOST=host.docker.internal
POSTGRES_PORT=8090
LOG_LEVEL=info

CLIENT_SECRET=<client secret from strava>

PGADMIN_DEFAULT_EMAIL=user@domain.com
PGADMIN_DEFAULT_PASSWORD=

```
