#! /bin/bash

yarn concurrently \
    -k \
    -c "auto" \
    "yarn start:server" \
    "yarn start:website" \
    "yarn start:db"
