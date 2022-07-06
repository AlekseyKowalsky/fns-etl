import { Readable, Writable } from "stream"
import * as unzipper from "unzipper"
import * as iconv from "iconv-lite"
import { IEgripRecord } from "./EgripDataProcessor"
import Database from "../Database"
import AbstractFetcher from "../DataFetcher/AbstractFetcher"
import { Logger, LoggerConstructor } from "../Logger"
import { Memory } from "../utils/Memory"
import { IEgrulRecord } from "./EgrulDataProcessor"

export default abstract class DataProcessor {
    public _logger!: LoggerConstructor

    constructor(readonly _dataFetcher: AbstractFetcher, readonly _database: Database) {
        this._logger = Logger.build(DataProcessor)
        this._logger.verbose("Created")
    }

    public async runETLProcess() {
        this._logger.debug("runETLProcess started")

        let zipCount: number = 0

        const zipIterator = await this._dataFetcher.getFullDataIterator()

        let zipStream: Readable | undefined
        do {
            zipStream = await zipIterator()
            if (!zipStream) break

            await this.createProcessingStream(zipStream)

            ++zipCount
            // eslint-disable-next-line no-constant-condition
        } while (true)

        this._logger.debug("runETLProcess finished")

        return { zipCount }
    }

    public async runUpdatingProcess() {
        let zipCount: number = 0

        const zipIterator = await this._dataFetcher.getTodayDataIterator()

        let zipStream: Readable | undefined
        do {
            zipStream = await zipIterator()
            if (!zipStream) break

            await this.createProcessingStream(zipStream)

            ++zipCount
            // eslint-disable-next-line no-constant-condition
        } while (true)

        return { zipCount }
    }

    private async createProcessingStream(readableStream: Readable) {
        this._logger.verbose("createProcessingStream called")

        const zip = readableStream.pipe(unzipper.Parse({ forceStream: true }))

        for await (const entry of zip) {
            this._logger.debug("Current file being processed: ", entry.path)

            const { fileDecodingStream, fileDecodingClosingEvent } = this.createFileDecodingStream()

            await entry.pipe(fileDecodingStream)

            await fileDecodingClosingEvent

            Memory.logMemory(this._logger)

            if (global.gc) {
                global.gc()
            }
        }
    }

    private createFileDecodingStream() {
        this._logger.verbose("createFileDecodingStream called")

        let xmlFile: string | null = ""

        const fileDecodingStream = new Writable({
            write: function(chunk, encoding, cb) {
                let bufferUtf8 = iconv.encode(iconv.decode(chunk, "win1251"), "utf8")
                xmlFile += bufferUtf8.toString("utf8") as string
                bufferUtf8 = Buffer.alloc(0)
                cb(null)
            },
        })

        const fileDecodingClosingEvent = new Promise((res) => {
            fileDecodingStream.on("close", () => res(this.saveToDB(this.getRecordsFromXmlString(xmlFile as string))))
        })

        return { fileDecodingStream, fileDecodingClosingEvent }
    }

    abstract getRecordsFromXmlString(xml: string): Array<IEgripRecord | IEgrulRecord>

    abstract saveToDB(records: Array<IEgripRecord | IEgrulRecord>): void
}
