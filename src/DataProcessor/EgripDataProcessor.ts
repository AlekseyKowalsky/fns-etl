import { xml2js } from "xml-js"
import strings from "../constants/strings"
import DataProcessor from "./AbstractDataProcessor"
import EGRIPFetcher from "../DataFetcher/EGRIPFetcher"
import Database from "../Database"
import { EventManager } from "../EventManager"
import { Size } from "../utils/SizeGuard"

export interface IEgripRecord {
    _id?: string
    _attributes: {
        ОГРНИП: string
    }
    history?: Array<IEgripRecord>
    [key: string]: any
}

export default class EgripDataProcessor extends DataProcessor {
    constructor(_dataFetcher: EGRIPFetcher, _database: Database) {
        super(_dataFetcher, _database)
    }

    async saveToDB(docs: Array<IEgripRecord>) {
        this._logger.verbose("saveToDB called")

        if (process.env.EMIT_EVENT === "1") {
            const compareNewWithOldPromise = async (doc) => {
                const oldRecord = await this._database.getFromEgrip(doc._id)
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
                this._logger.warn(`Документ ОГРНИП ${doc["_attributes"]["ОГРНИП"]} больше 16 мб и не может быть сохранен`)
                return false
            }
            return true
        })

        try {
            const res = await this._database.insertManyIntoEGRIP(filteredDocs)

            this._logger.debug(`Amount of saved docs ---> ${JSON.stringify(res["nUpserted"])}`)
            this._logger.debug(`Amount of modified docs ---> ${JSON.stringify(res["nModified"])}`)
        } catch (e) {
            this._logger.error("Error while inserting docs into DB ---> ", e)
            throw e
        }
    }

    getRecordsFromXmlString(xml: string): Array<IEgripRecord> {
        this._logger.verbose("getRecordsFromXmlString called")

        const { EGRIP } = xml2js(xml, { compact: true, alwaysChildren: true, alwaysArray: true }) as {
            EGRIP: [{ [x: string]: Array<IEgripRecord> }]
        }
        return EGRIP[0][strings.registerTag.recordEgrip].map((r) => ({ ...r, _id: r["_attributes"]["ОГРНИП"] }))
    }

    async emitEvent(oldDoc: IEgripRecord, newDoc: IEgripRecord) {
        this._logger.verbose("emitEvent called")

        const docId = oldDoc._id
        const manager = await new EventManager(docId).produceChangesSnapshot(oldDoc, newDoc, { ignoredFields: ["history", "_id"] })
        if (manager.changesAmount) manager.send()
    }
}
