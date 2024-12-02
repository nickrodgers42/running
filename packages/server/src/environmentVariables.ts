export function getOrThrow<T, K extends keyof T>(obj: T, key: K): T[K] {
    const value = obj[key]
    if (value === undefined) {
        throw Error(`Key ${key.toString()} not found`)
    }
    return value
}

export function getOrElse<T, K extends keyof T, V>(obj: T, key: K, elseValue: V): T[K] | V {
    const value = obj[key]
    if (value !== undefined) {
        return value
    }
    return elseValue
}

export enum EnvironmentVariables {
    CLIENT_SECRET = 'CLIENT_SECRET',
    LOG_LEVEL = 'LOG_LEVEL',
    POSTGRES_HOST = 'POSTGRES_HOST',
    POSTGRES_PASSWORD = 'POSTGRES_PASSWORD',
    POSTGRES_PORT = 'POSTGRES_PORT',
    POSTGRES_USER = 'POSTGRES_USER'
}
