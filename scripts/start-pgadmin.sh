#! /bin/bash

docker run \
    --name pgadmin-container \
    --publish 5050:80 \
    --env-file=.env \
    --attach STDOUT \
    --rm \
    pgadmin
