import Environment from "./Environment"
import Database from "./Database"
import HttpManager from "./HttpManager"
import EgrulDataProcessor from "./DataProcessor/EgrulDataProcessor"
import ERGULFetcher from "./DataFetcher/EGRULFetcher"
import { Logger } from "./Logger"

async function BootstrapFullEgrulData() {
    const environment = new Environment().init()

    Logger.init(environment.envs.LOG_LEVEL)

    const logger = Logger.build(BootstrapFullEgrulData)
    logger.verbose("Called")

    const httpManager = new HttpManager(environment.envs)
    const database = await Database.build(environment.envs)
    const dataFetcher = new ERGULFetcher(environment.envs, httpManager)
    const dataProcessor = new EgrulDataProcessor(dataFetcher, database)

    return dataProcessor.runETLProcess()
}

const startTime = Date.now()
BootstrapFullEgrulData()
    .then(({ zipCount }) => {
        const timing = (Date.now() - startTime) / 60000 + "min"

        const logger = Logger.build(BootstrapFullEgrulData)
        logger.log(
            `Succeed EGRUL: timing -> ${timing},
             zipCount -> ${zipCount}`,
        )

        setTimeout(() => process.exit(0), 3000)
    })
    .catch((e) => {
        const logger = Logger.build(BootstrapFullEgrulData)
        logger.log("Failed EGRUL ---> ", e)

        process.exit(1)
    })
