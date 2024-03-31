import { EnvLoader } from "../src/envLoader"

export default async function (globalConfig: unknown, projectConfig: unknown) {
    const envLoader = new EnvLoader()
    envLoader.load()
    if (process.env.LOG_LEVEL == undefined) {
        process.env.LOG_LEVEL = "silent"
    }
}
