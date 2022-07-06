import Environment from "./Environment"
import Database from "./Database"
import HttpManager from "./HttpManager"
import EGRIPFetcher from "./DataFetcher/EGRIPFetcher"
import EgripDataProcessor from "./DataProcessor/EgripDataProcessor"
import { Logger } from "./Logger"

async function BootstrapFullEgripData() {
    const environment = new Environment().init()

    Logger.init(environment.envs.LOG_LEVEL)

    const logger = Logger.build(BootstrapFullEgripData)
    logger.verbose("Called")

    const httpManager = new HttpManager(environment.envs)
    const dataFetcher = new EGRIPFetcher(environment.envs, httpManager)
    const database = await Database.build(environment.envs)
    const dataProcessor = new EgripDataProcessor(dataFetcher, database)

    return dataProcessor.runETLProcess()
}

const startTime = Date.now()

BootstrapFullEgripData()
    .then(({ zipCount }) => {
        const timing = (Date.now() - startTime) / 60000 + "min"

        const logger = Logger.build(BootstrapFullEgripData)
        logger.log(
            `Succeed EGRIP: timing -> ${timing},
             zipCount -> ${zipCount}, `,
        )

        setTimeout(() => process.exit(0), 3000)
    })
    .catch((e) => {
        const logger = Logger.build(BootstrapFullEgripData)
        logger.error("Failed EGRIP ---> ", e)

        process.exit(1)
    })
