import { existsSync, lstatSync, readFileSync } from "fs";
import { resolve } from "path";

class FileNotFoundError extends Error {}

export class FileReader {
    static readFile(path: string): string {
        const absPath = resolve(path)
        if (existsSync(absPath) && lstatSync(absPath).isFile()) {
            return readFileSync(absPath).toString()
        }
        throw new FileNotFoundError(`File not found: ${absPath.toString()}`)
    }
}
