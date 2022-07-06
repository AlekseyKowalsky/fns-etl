import * as dotenv from "dotenv"
import EnvVarsDTO from "./EnvVarsDTO"
import strings from "../constants/strings"
import * as _ from "lodash"

if (!process.env.ENV) {
    dotenv.config()
}

export default class Environment {
    private _envs = new EnvVarsDTO()

    public init(): Environment {
        this.fillEnvsByGivenVars()
        this.checkUnsetEnvs(this._envs)
        return this
    }

    private fillEnvsByGivenVars(): void {
        const envNames = Object.keys(this._envs)
        this._envs = Object.assign(this._envs, _.pick(process.env, envNames))
    }

    private checkUnsetEnvs(envs: object): void {
        const unsetEnvs = Object.entries(envs).filter(([key, val]) => !val)

        if (unsetEnvs.length) {
            console.error(
                strings.error.unsetEnvs,
                unsetEnvs.map((el) => el[0]),
            )

            process.exit(9)
        }
    }

    get envs(): EnvVarsDTO {
        return this._envs
    }
}
