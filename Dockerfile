FROM postgres as db

COPY packages/database/sql/schema.sql /docker-entrypoint-initdb.d/


FROM gradle:8.6.0-jdk17-alpine AS java-base

FROM java-base AS model

workdir /model

COPY ./packages/model .
RUN gradle build


FROM java-base AS strava

RUN apk update \
 && apk add --no-cache jq \
 && rm -rf /var/cache/apk/*

workdir /strava

COPY ./packages/strava .

RUN ./build.sh


FROM node:18-alpine AS base

RUN yarn set version stable

workdir /running
COPY --from=model /model ./packages/model
COPY package.json .
COPY yarn.lock .
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
