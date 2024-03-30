#! /bin/bash

docker volume create pgdata

docker run \
    -i \
    --rm \
    --publish 5432:5432 \
    --env-file=.env \
    --name local-db \
    --volume pgdata:/var/lib/postgresql/data \
    db
