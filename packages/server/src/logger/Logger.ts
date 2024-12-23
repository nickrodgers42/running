import pino from "pino"
import { EnvironmentVariables, getOrElse } from "../environmentVariables"

export default class Logger {
    static create<CustomLevels extends string = never>(
        options?: pino.LoggerOptions<CustomLevels>,
    ): pino.Logger<CustomLevels> {
        return pino({
            level: getOrElse(
                process.env,
                EnvironmentVariables.LOG_LEVEL,
                "info",
            ),
            ...options,
        })
    }
}
