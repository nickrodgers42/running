import pino from "pino"

export default class Logger {
    static create<CustomLevels extends string = never>(
        options?: pino.LoggerOptions<CustomLevels>,
    ): pino.Logger<CustomLevels> {
        return pino({
            level: process.env.LOG_LEVEL || "info",
            ...options,
        })
    }
}
