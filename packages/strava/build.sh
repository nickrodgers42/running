#!/bin/sh

wget https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.52/swagger-codegen-cli-3.0.52.jar -O swagger-codegen-cli.jar
java -jar swagger-codegen-cli.jar generate -i https://developers.strava.com/swagger/swagger.json -l typescript-axios -o .
echo "$(jq '.name = "strava" | .packageManager = "yarn@4.1.1"' package.json)" > ./package.json
yarn add axios@1.7.9
