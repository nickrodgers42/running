import { DotenvConfigOptions } from "dotenv";
import findWorkspaceRoot from "find-yarn-workspace-root";
import { config as dotenv } from "dotenv"

export class EnvLoader {
    private options: DotenvConfigOptions = {
        path: `${findWorkspaceRoot()}/.env`
    }

    constructor(dotenvOptions?: DotenvConfigOptions) {
        if (dotenvOptions != undefined) {
            this.options = dotenvOptions
        }
    }

    load() {
        dotenv(this.options)
    }
}
