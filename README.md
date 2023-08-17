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

To build run `yarn build` from the base directory, which will build the model
and install dependencies. Then `yarn start` to start the server and website
