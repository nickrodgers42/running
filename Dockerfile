FROM postgres AS db

COPY packages/database/sql/ /docker-entrypoint-initdb.d/


FROM gradle:8.11.1-jdk17 AS java-base

FROM java-base AS model

WORKDIR /model

COPY ./packages/model .
RUN gradle build


FROM java-base AS strava

RUN apt update \
 && apt install -y jq

WORKDIR /strava

COPY ./packages/strava .

RUN ./build.sh


FROM node:18-alpine AS base

RUN yarn set version stable

WORKDIR /running
COPY --from=model /model ./packages/model
COPY ./node_modules .
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
RUN yarn install
RUN yarn build:projections
RUN yarn install


FROM base AS website

COPY packages/website ./packages/website
RUN yarn install


FROM base AS server

COPY --from=strava /strava ./packages/strava
COPY .env .
COPY packages/server ./packages/server
RUN yarn install
