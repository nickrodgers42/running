swagger-codegen generate -i https://developers.strava.com/swagger/swagger.json -l typescript-axios -o packages/strava
echo "$(jq '.name = "strava" | .packageManager = "yarn@3.6.1"' packages/strava/package.json)" > packages/strava/package.json
