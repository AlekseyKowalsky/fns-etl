import { xml2js } from "xml-js"

import strings from "../constants/strings"
import DataProcessor from "./AbstractDataProcessor"
import Database from "../Database"
import EGRULFetcher from "../DataFetcher/EGRULFetcher"
import { EventManager } from "../EventManager"
import { Size } from "../utils/SizeGuard"

export interface IEgrulRecord {
    _id?: string
    _attributes: {
        ОГРН: string
    }
    history?: Array<IEgrulRecord>
    [key: string]: any
}

export default class EgrulDataProcessor extends DataProcessor {
    constructor(_dataFetcher: EGRULFetcher, _database: Database) {
        super(_dataFetcher, _database)
    }

    async saveToDB(docs: Array<IEgrulRecord>) {
        this._logger.verbose("saveToDB called")

        if (process.env.EMIT_EVENT === "1") {
            const compareNewWithOldPromise = async (doc) => {
                const oldRecord = await this._database.getFromEgrul(doc._id)
                if (!oldRecord) return Promise.resolve()
                await this.emitEvent(oldRecord, doc)
            }

            try {
                await Promise.all(docs.map(compareNewWithOldPromise))
            } catch (e) {
                this._logger.error("Error while comparing old docs with new docs ---> ", e)
                throw e
            }
        }

        const filteredDocs = docs.filter((doc) => {
            if (Size.measureJSONSizeMB(doc) >= 16) {
                this._logger.warn(`Документ ОГРН ${doc["_attributes"]["ОГРН"]} больше 16 мб и не может быть сохранен`)
                return false
            }
            return true
        })

        try {
            const res = await this._database.insertManyIntoEGRUL(filteredDocs)

            this._logger.debug(`Amount of saved docs ---> ${JSON.stringify(res["nUpserted"])}`)
            this._logger.debug(`Amount of modified docs ---> ${JSON.stringify(res["nModified"])}`)
        } catch (e) {
            this._logger.error("Error while inserting docs into DB ---> ", e)
            throw e
        }
    }

    getRecordsFromXmlString(xml: string): Array<IEgrulRecord> {
        this._logger.verbose("getRecordsFromXmlString called")

        const { EGRUL } = xml2js(xml, {
            compact: true,
            alwaysChildren: true,
            alwaysArray: true,
        }) as {
            EGRUL: [{ [x: string]: Array<IEgrulRecord> }]
        }

        return EGRUL[0][strings.registerTag.recordEgrul].map((company: IEgrulRecord) => {
            return {
                ...company,
                _id: company["_attributes"]["ОГРН"],
            }
        })
    }

    async emitEvent(oldDoc: IEgrulRecord, newDoc: IEgrulRecord) {
        this._logger.verbose("emitEvent called")

        const docId = oldDoc._id
        const manager = await new EventManager(docId).produceChangesSnapshot(oldDoc, newDoc, {
            ignoredFields: ["history", "_id"],
        })
        if (manager.changesAmount) manager.send()
    }
}
