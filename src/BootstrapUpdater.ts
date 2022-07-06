import Environment from "./Environment"
import strings from "./constants/strings"
import Database from "./Database"
import { Cron } from "./Cron"
import { Logger, LoggerConstructor } from "./Logger"

class BootstrapUpdater {
    private _environment!: Environment
    private _database!: Database

    private _logger!: LoggerConstructor

    public async init(): Promise<void> {
        this.initEnvironment()
        this.initLogger()

        this._logger = Logger.build(BootstrapUpdater)
        this._logger.verbose("Called")

        await this.initDBConnection()
        this.initJobs()
    }

    private initEnvironment(): void {
        this._environment = new Environment().init()
    }

    private async initDBConnection(): Promise<void> {
        if (!this._environment) throw new Error(strings.error.undefinedEnvironment)
        this._database = await Database.build(this._environment.envs)
    }

    private initLogger() {
        Logger.init(this._environment.envs.LOG_LEVEL)
    }

    private initJobs() {
        const cron = new Cron(this._database, this._environment?.envs)
        cron.init()
    }
}

new BootstrapUpdater().init().catch((err) => {
    const logger = Logger.build(BootstrapUpdater)
    logger.error("Exit ---> ", err)

    process.exit(1)
})
