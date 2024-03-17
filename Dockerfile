FROM gradle:8.6.0-jdk17-alpine AS model

workdir /model

COPY ./packages/model .
RUN gradle build


FROM node:18-alpine AS base

RUN yarn set version stable

workdir /running
COPY --from=model /model ./packages/model
COPY package.json .
COPY yarn.lock .
RUN yarn install
RUN yarn build:projections
RUN yarn install


FROM postgres as db

COPY packages/database/sql/schema.sql /docker-entrypoint-initdb.d/


FROM base AS website

COPY packages/website ./packages/website
RUN yarn install


FROM base AS server

COPY packages/server ./packages/server
RUN yarn install
