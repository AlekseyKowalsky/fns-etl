import * as mongoose from "mongoose"
import { EEgrulIndexPaths } from "../indexPaths/EEgrulIndexPaths"
const { Schema } = mongoose

// TODO: если схема выписки когда-нибудь будет типизирована, то определить ее как содержимое history
const schema = new Schema({ _id: String, history: [{}] }, { strict: false, collection: "EGRUL", _id: false })

schema.index(
    {
        [EEgrulIndexPaths.ogrn]: "text",
        [EEgrulIndexPaths.inn]: "text",
        [EEgrulIndexPaths.shortName]: "text",
        [EEgrulIndexPaths.longName]: "text",
        [EEgrulIndexPaths.workerSecondName]: "text",
        [EEgrulIndexPaths.creatorFLSecondName]: "text",
        [EEgrulIndexPaths.creatorULRos]: "text",
        [EEgrulIndexPaths.creatorULin]: "text",
        [EEgrulIndexPaths.creatorULRosMO]: "text",
        [EEgrulIndexPaths.region]: "text",
        [EEgrulIndexPaths.district]: "text",
        [EEgrulIndexPaths.city]: "text",
        [EEgrulIndexPaths.town]: "text",
        [EEgrulIndexPaths.street]: "text",
        [EEgrulIndexPaths.house]: "text",
    },
    {
        weights: {
            [EEgrulIndexPaths.ogrn]: 10000,
            [EEgrulIndexPaths.inn]: 9000,
            [EEgrulIndexPaths.shortName]: 8000,
            [EEgrulIndexPaths.longName]: 7000,
            [EEgrulIndexPaths.workerSecondName]: 110,
            [EEgrulIndexPaths.creatorFLSecondName]: 100,
            [EEgrulIndexPaths.creatorULRos]: 90,
            [EEgrulIndexPaths.creatorULin]: 80,
            [EEgrulIndexPaths.creatorULRosMO]: 70,
            [EEgrulIndexPaths.region]: 60,
            [EEgrulIndexPaths.district]: 50,
            [EEgrulIndexPaths.city]: 40,
            [EEgrulIndexPaths.town]: 30,
            [EEgrulIndexPaths.street]: 20,
            [EEgrulIndexPaths.house]: 10,
        },
        default_language: "russian",
    },
)

export default schema
