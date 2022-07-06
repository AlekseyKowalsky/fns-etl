import * as mongoose from "mongoose"
import * as _ from "lodash"
import { has } from "lodash"

import { IEgripRecord } from "../DataProcessor/EgripDataProcessor"
import EnvVarsDTO from "../Environment/EnvVarsDTO"
import { EEgrulIndexPaths } from "./indexPaths/EEgrulIndexPaths"
import { CollectionNames } from "./schemas/CollectionNames"
import EGRUL from "./schemas/EGRUL"
import EGRIP from "./schemas/EGRIP"
import sortByScore from "./utils/sortByScore"
import { Logger } from "../Logger"
import { IEgrulRecord } from "../DataProcessor/EgrulDataProcessor"

export interface Search {
    searchString: string
    filters: SearchFilters
    limit?: number
}

export interface SearchByIndex {
    searchString: string
    filters?: SearchFilters
    limit: number
}

export interface SearchByRegex {
    searchString: string
    filters?: SearchFilters
    limit: number
}

export interface SearchFilters {
    egrulStatus?: number
}

export default class Database {
    constructor(private _connection: mongoose.Connection) {}

    static async build(envs: EnvVarsDTO): Promise<Database> {
        const logger = Logger.build(Database)

        const { MONGO_DB_NAME, MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_CONNECTION_PARAMS } = envs

        const connectionString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}${MONGO_CONNECTION_PARAMS}`

        let connection
        try {
            connection = await mongoose.createConnection(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            logger.debug("Connected")
        } catch (e) {
            logger.error("Connection error -> ", e)
            throw e
        }

        logger.verbose("Built")
        return new Database(connection)
    }

    public async insertManyIntoEGRIP(records: Array<IEgripRecord>) {
        const bulkData = records.map((r) => ({
            replaceOne: {
                upsert: true,
                filter: { _id: r._id },
                replacement: r,
            },
        }))

        return this.models[CollectionNames.EGRIP].collection.bulkWrite(bulkData)
    }

    public async insertManyIntoEGRUL(records: Array<IEgrulRecord>) {
        const bulkData = records.map((r) => ({
            replaceOne: {
                upsert: true,
                filter: { _id: r._id },
                replacement: r,
            },
        }))

        return this.models[CollectionNames.EGRUL].collection.bulkWrite(bulkData)
    }

    public async getFromEgrul(id: string): Promise<IEgrulRecord | null> {
        try {
            return (this.models[CollectionNames.EGRUL].findById(id).lean() as unknown) as IEgrulRecord
        } catch (e) {
            console.error(e)
            return null
        }
    }

    public async getFromEgrip(id: string): Promise<IEgripRecord | null> {
        try {
            return (this.models[CollectionNames.EGRIP].findById(id).lean() as unknown) as IEgripRecord
        } catch (e) {
            console.error(e)
            return null
        }
    }

    public async search({ searchString, filters, limit = 50 }: Search) {
        const fullDocsMatches = await this.searchByIndex({
            searchString,
            filters,
            limit,
        })

        try {
            const allDocs = [...fullDocsMatches]

            const sortedDocs = sortByScore(allDocs)
            const uniqDocs = _.uniqBy(sortedDocs, "_id")

            return { documents: uniqDocs.slice(0, limit) }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    private async searchByIndex({ searchString, filters, limit }: SearchByIndex) {
        const searchInEgripFn = () =>
            this.models[CollectionNames.EGRIP]
                .find(
                    {
                        $text: { $search: searchString },
                    },
                    { score: { $meta: "textScore" } },
                )
                .sort({ score: { $meta: "textScore" } })

        const searchInEgrulFn = () =>
            this.models[CollectionNames.EGRUL]
                .find(
                    {
                        ...(has(filters, "egrulStatus") && {
                            status: filters?.egrulStatus,
                        }),
                        $text: { $search: searchString },
                    },
                    { score: { $meta: "textScore" } },
                )
                .sort({ score: { $meta: "textScore" } })

        try {
            const [egrulDocs, egripDocs] = await Promise.all(
                [searchInEgripFn, searchInEgrulFn].map((fn) =>
                    fn()
                        .limit(limit)
                        .exec(),
                ),
            )

            return [...egrulDocs, ...egripDocs]
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    private async searchByRegex({ searchString, filters, limit }: SearchByRegex) {
        let searchStrings = [searchString]
        if (searchString.split(" ").length) {
            searchStrings = [searchString, ...searchString.split(" ")]
        }

        const searchInEgrulForShortNameFn = (str) =>
            this.models[CollectionNames.EGRUL].find({
                ...(has(filters, "egrulStatus") && {
                    status: filters?.egrulStatus,
                }),
                [EEgrulIndexPaths.shortName]: new RegExp(str, "i"),
            })

        const searchInEgrulForLongNameFn = (str) =>
            this.models[CollectionNames.EGRUL].find({
                ...(has(filters, "egrulStatus") && {
                    status: filters?.egrulStatus,
                }),
                [EEgrulIndexPaths.longName]: new RegExp(str, "i"),
            })

        try {
            const shortNameDocsMatches = await Promise.all(
                searchStrings.map((srt) =>
                    searchInEgrulForShortNameFn(srt)
                        .limit(limit)
                        .exec(),
                ),
            )

            const longNameDocsMatches = await Promise.all(
                searchStrings.map((srt) =>
                    searchInEgrulForLongNameFn(srt)
                        .limit(limit)
                        .exec(),
                ),
            )

            return {
                shortNameDocsMatches: _.flatten(shortNameDocsMatches),
                longNameDocsMatches: _.flatten(longNameDocsMatches),
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    get models() {
        return {
            EGRUL: this._connection.model(CollectionNames.EGRUL, EGRUL),
            EGRIP: this._connection.model(CollectionNames.EGRIP, EGRIP),
        }
    }

    get connection(): mongoose.Connection {
        return this._connection
    }

    get collectionNames(): string[] {
        return Object.keys(this._connection.collections)
    }
}
