import EnvVarsDTO from "../Environment/EnvVarsDTO"
import * as CRON from "cron"
import Database from "../Database"
import HttpManager from "../HttpManager"
import EGRIPFetcher from "../DataFetcher/EGRIPFetcher"
import EgripDataProcessor from "../DataProcessor/EgripDataProcessor"
import EgrulDataProcessor from "../DataProcessor/EgrulDataProcessor"
import GetTodayDDMMYYYY from "../utils/GetTodayDDMMYYYY"
import EGRULFetcher from "../DataFetcher/EGRULFetcher"
import { Logger, LoggerConstructor } from "../Logger"

export class Cron {
    private _logger!: LoggerConstructor
    updatingJob!: CRON.CronJob

    constructor(private _database: Database, private _envs: EnvVarsDTO) {
        this._logger = Logger.build(Cron)
        this._logger.verbose("Created")
    }

    public init() {
        this.createUpdatingJob().start()
        this._logger.log("Updating Job has been started")
    }

    private createUpdatingJob() {
        this.updatingJob = new CRON.CronJob(
            this._envs.CRON_UPDATE_PATTERN,
            async () => {
                const httpManager = new HttpManager(this._envs)
                let dataProcessor

                switch (this._envs.UPDATE_MODE) {
                    case "EGRIP":
                        dataProcessor = new EgripDataProcessor(new EGRIPFetcher(this._envs, httpManager), this._database)
                        break
                    case "EGRUL":
                    default:
                        dataProcessor = new EgrulDataProcessor(new EGRULFetcher(this._envs, httpManager), this._database)
                }

                this._logger.log(`${this._envs.UPDATE_MODE}: start uploading for ${GetTodayDDMMYYYY()}`)

                await dataProcessor.runUpdatingProcess()

                this._logger.log("DONE")
            },
            null,
            true,
            "Europe/Moscow",
        )

        return this.updatingJob
    }
}
