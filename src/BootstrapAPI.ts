import * as express from "express"
import Environment from "./Environment"
import strings from "./constants/strings"
import Database from "./Database"
import { ErrorRequestHandler } from "express"
import routes, { IRoute } from "./API/routes"
import { Logger, LoggerConstructor } from "./Logger"

const expressSwagger = require("express-swagger-generator")

class BootstrapAPI {
    private _app: express.Application = express()
    private _environment!: Environment
    private _database!: Database

    private _logger!: LoggerConstructor

    public async init(): Promise<void> {
        this.initEnvironment()
        this.initLogger()

        this._logger = Logger.build(BootstrapAPI)
        this._logger.verbose("Called")

        await this.initDBConnection()
        // this.plugAuth()
        this.plugRoutes(routes)
        this.plugErrorHandling()
        this.plugSwagger()
        this.listen()
    }

    private initEnvironment(): void {
        this._environment = new Environment().init()
    }

    private async initDBConnection(): Promise<void> {
        if (!this._environment) throw new Error(strings.error.undefinedEnvironment)
        this._database = await Database.build(this._environment.envs)
    }

    private plugAuth() {
        this._app.use((req, res, next) => {
            if (!req.headers.authorization) res.status(401).send("Unauthorized")

            const secret = req.headers.authorization?.split(" ")[1]
            if (!secret || secret !== this._environment.envs.API_SECRET) {
                res.status(401).send("Unauthorized")
            }
            next()
        })
    }

    private plugRoutes(routes: Array<IRoute>) {
        routes.forEach(({ method, path, controller }) => {
            const initializedController = new controller(this._database)
            this._app[method](path, initializedController.handler)
        })
    }

    plugErrorHandling() {
        const errorHandling: ErrorRequestHandler = (error, req, res, next) => {
            if (error) return res.status(500).send("Inner server error")
        }
        this._app.use(errorHandling)
    }

    plugSwagger() {
        const swaggerRunner = expressSwagger(this._app)

        const options = {
            swaggerDefinition: {
                info: {
                    description: "This is a sample server",
                    title: "Swagger",
                    version: "1.0.0",
                },
                host: `${this._environment?.envs.HOST}:${this._environment?.envs.PORT}`,
                basePath: "/api/",
                produces: ["application/json", "application/xml"],
                schemes: ["http", "https"],
                securityDefinitions: {
                    JWT: {
                        type: "apiKey",
                        in: "header",
                        name: "Authorization",
                        description: "",
                    },
                },
            },
            basedir: __dirname, //app absolute path
            files: ["./**/*.ts"], //Path to the API handle folder
        }

        swaggerRunner(options)
    }

    private initLogger() {
        Logger.init(this._environment.envs.LOG_LEVEL)
    }

    private listen(): void {
        this._app.listen(this._environment?.envs.PORT, () => {
            this._logger.log(strings.info.serverStartMessage, `http://${this._environment?.envs.HOST}:${this._environment?.envs.PORT}`)
        })
    }
}

new BootstrapAPI().init().catch((err) => {
    const logger = Logger.build(BootstrapAPI)

    logger.error("Exit ---> ", err)
    process.exit(1)
})
