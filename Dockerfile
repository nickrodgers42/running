FROM postgres AS db

COPY packages/database/sql/ /docker-entrypoint-initdb.d/


FROM gradle:8.11.1-jdk17 AS java-base

FROM java-base AS model

WORKDIR /model

COPY ./packages/model .
RUN gradle build


FROM node:23-alpine AS strava

RUN apk update \
 && apk add jq

WORKDIR /strava

COPY ./packages/strava .

RUN ./build.sh
RUN corepack enable && corepack prepare yarn@4.1.1
RUN yarn add axios@1.7.9

FROM node:23-alpine AS base

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
