import * as _ from "lodash"

export enum ELogLevels {
    VERBOSE = "verbose",
    DEBUG = "debug",
    LOG = "log",
    WARN = "warn",
    ERROR = "error",
}

export class LoggerConstructor {
    private contextName?: string
    private level!: ELogLevels
    private configuredLogLevels!: Array<ELogLevels>

    constructor(context?) {
        this.contextName = (context && context.name) || "Unknown context"
    }

    public init(level: ELogLevels | undefined) {
        if (!level || !Object.values(ELogLevels).includes(level)) throw new Error("Set up LOG_LEVEL env. to initiate Logger")

        const index = Object.values(ELogLevels).indexOf(level)
        this.configuredLogLevels = Object.values(ELogLevels).slice(index)
        this.level = level
    }

    public build(context?) {
        const contextLogger = new LoggerConstructor(context)
        contextLogger.init(this.level)
        return contextLogger
    }

    public verbose(...strings) {
        if (this.configuredLogLevels.includes(ELogLevels.VERBOSE))
            console.log(_.capitalize(ELogLevels.VERBOSE), `${this.contextName}: `, strings.join(" "))
    }

    public debug(...strings) {
        if (this.configuredLogLevels.includes(ELogLevels.DEBUG))
            console.debug(_.capitalize(ELogLevels.DEBUG), `${this.contextName}: `, strings.join(" "))
    }

    public log(...strings) {
        if (this.configuredLogLevels.includes(ELogLevels.LOG))
            console.log(_.capitalize(ELogLevels.LOG), `${this.contextName}: `, strings.join(" "))
    }

    public warn(...strings) {
        if (this.configuredLogLevels.includes(ELogLevels.WARN))
            console.warn(_.capitalize(ELogLevels.WARN), `${this.contextName}: `, strings.join(" "))
    }

    public error(...strings) {
        if (this.configuredLogLevels.includes(ELogLevels.ERROR))
            console.error(_.capitalize(ELogLevels.ERROR), `${this.contextName}: `, strings.join(" "))
    }
}

export const Logger = new LoggerConstructor()
