export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export function keysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(keysToCamelCase)
    } else if (typeof obj === "object" && obj !== null) {
        /* eslint-disable-next-line */
        const newObj: any = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelCaseKey = toCamelCase(key)
                newObj[camelCaseKey] = keysToCamelCase(obj[key])
            }
        }
        return newObj
    } else {
        return obj
    }
}
