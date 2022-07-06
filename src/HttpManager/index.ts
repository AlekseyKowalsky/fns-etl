import EnvVarsDTO from "../Environment/EnvVarsDTO"
import strings from "../constants/strings"
import axios, { AxiosInstance } from "axios"
import * as cheerio from "cheerio"
import * as https from "https"
import * as fs from "fs"

import { Logger, LoggerConstructor } from "../Logger"
import delay from "../utils/delay"

export default class HttpManager {
    private readonly axiosInstance!: AxiosInstance

    private _logger!: LoggerConstructor

    constructor(private _envs: EnvVarsDTO) {
        this._logger = Logger.build(HttpManager)

        const httpsAgent = new https.Agent({
            passphrase: _envs.SSL_CERT_PASSPHRASE,
            pfx: fs.readFileSync(process.cwd() + "/certificate.p12"),
        })
        this.axiosInstance = axios.create({ httpsAgent })
        this.axiosInstance.interceptors.response.use(
            (response) => {
                return response
            },
            async (error) => {
                const retryErrors = [429, 500, 502, 504]
                const isRetryError = retryErrors.includes(error.response.status)
                if (isRetryError) {
                    this._logger.error(`retry : request error  ---> ${error.response.status}`)
                    await delay(150)
                    return this.axiosInstance.request(error.config)
                }

                return Promise.reject(error)
            },
        )
        this._logger.verbose("Created")
    }

    public async getDirectoryContentList(dirPath: string): Promise<{ content: string[]; sizes: number[] }> {
        this._logger.verbose("getDirectoryContentList called")
        await delay(100)

        try {
            const content: Array<string> = []
            const sizes: Array<number> = []

            const { data: html } = await this.axiosInstance.get(`https://${this._envs.SOURCE_HOST}/?dir=${dirPath}`)

            const $ = cheerio.load(html)

            $("li[data-name*=zip]").each((i, elem) => {
                const link = $(elem)
                    .find("a.clearfix")
                    .attr("href")
                if (link) content.push(link)

                const size = $(elem)
                    .find("a.clearfix span.file-size")
                    .html()

                sizes.push(Number.parseFloat(size || "0"))
            })

            const directorySize = sizes.reduce((acc, size) => acc + size, 0)

            this._logger.debug(`In ${dirPath} are following zip (all is ${directorySize}MB): ${content}`)

            return { content, sizes }
        } catch (err) {
            throw new Error(`${strings.error.ftpListingError} for ${dirPath} ---> ${err}`)
        }
    }

    public async downloadFile(remotePath: string) {
        this._logger.verbose("downloadFileTo called")

        try {
            this._logger.debug(`Stream of ${remotePath} started`)

            const { data: dataStream } = await this.axiosInstance.get(`https://${this._envs.SOURCE_HOST}/${remotePath}`, {
                responseType: "stream",
            })

            return dataStream
        } catch (err) {
            this._logger.error(`Zip (${remotePath}): request error  ---> ${err}`)
            throw new Error(strings.error.ftpDownloadError + err)
        }
    }
}
