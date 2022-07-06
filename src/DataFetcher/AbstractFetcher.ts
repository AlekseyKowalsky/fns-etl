import EnvVarsDTO from "../Environment/EnvVarsDTO"
import HttpManager from "../HttpManager"
import GetDateArrayUpToNow from "../utils/GetDateArrayUpToNow"
import GetTodayDDMMYYYY from "../utils/GetTodayDDMMYYYY"
import { Logger, LoggerConstructor } from "../Logger"
import { Readable } from "stream"

export default abstract class AbstractFetcher {
    private _logger!: LoggerConstructor

    protected constructor(public _envs: EnvVarsDTO, public _httpManager: HttpManager) {
        this._logger = Logger.build(AbstractFetcher)
        this._logger.verbose("Created")
    }

    public async createZipIteratorStreamUpToNow(pathToRegister: string): Promise<() => Promise<Readable> | undefined> {
        this._logger.verbose("createZipIteratorStreamUpToNow called")

        const { START_UPLOADING_FULL_YEAR, START_UPLOADING_DATE, START_ZIP } = this._envs

        let pathsToZip: Array<string> = []
        let zipSizes: Array<number> = []

        const years: number[] = []
        for (let y = +START_UPLOADING_FULL_YEAR; y <= new Date().getFullYear(); y++) {
            years.push(y)
        }
        for await (const year of years) {
            try {
                const pathToFullData = `${pathToRegister}/01.01.${year}_FULL`
                const { content, sizes } = await this._httpManager.getDirectoryContentList(pathToFullData)
                pathsToZip = pathsToZip.concat(content)
                zipSizes = zipSizes.concat(sizes)
            } catch (e) {
                this._logger.warn(`Ошибка листинга - ${year} ---> ${e}`)
                continue
            }
        }

        const actualDates = (() => {
            const index = GetDateArrayUpToNow().indexOf(START_UPLOADING_DATE)
            return GetDateArrayUpToNow().slice(index)
        })()

        for await (const date of actualDates) {
            try {
                const { content, sizes } = await this._httpManager.getDirectoryContentList(pathToRegister + "/" + date)
                pathsToZip = pathsToZip.concat(content)
                zipSizes = zipSizes.concat(sizes)
            } catch (e) {
                this._logger.warn(`Ошибка листинга - ${date} ---> ${e}`)
                continue
            }
        }

        const startIndex = pathsToZip.indexOf(START_ZIP)
        if (startIndex >= 0) {
            pathsToZip = pathsToZip.slice(startIndex)
            this._logger.log(`START_ZIP variable *${START_ZIP}* has been used. Current pathsToZip array for uploading is:
            ${pathsToZip}`)
        }

        const generalSize = zipSizes.reduce((acc, size) => acc + size)
        this._logger.log(`The general size to uploading is ${generalSize / 1000}GB`)

        return () => {
            if (!pathsToZip.length) return
            const path = pathsToZip.shift()
            return this.runZipStream(`${path}`)
        }
    }

    public async createZipIteratorStreamForToday(pathToRegister: string): Promise<() => Promise<Readable> | undefined> {
        const pathToTodayData = `${pathToRegister}/${GetTodayDDMMYYYY()}`

        let zipNames: Array<string> = []
        let zipSizes: Array<number> = []

        try {
            const { content, sizes } = await this._httpManager.getDirectoryContentList(pathToTodayData)
            zipNames = content
            zipSizes = sizes
        } catch (e) {
            this._logger.warn("Не обнаружена папка с ежедневными изменениями: " + e)
            return () => undefined
        }
        const generalSize = zipSizes.reduce((acc, size) => acc + size)
        this._logger.log(`The general size to uploading is ${generalSize / 1000}GB`)

        return () => {
            if (!zipNames.length) return
            const path = zipNames.pop()
            return this.runZipStream(`${path}`)
        }
    }

    private runZipStream(path: string): Promise<any> {
        return this._httpManager.downloadFile(path)
    }

    abstract getFullDataIterator(): Promise<() => Promise<Readable> | undefined>

    abstract getTodayDataIterator(): Promise<() => Promise<Readable> | undefined>
}
