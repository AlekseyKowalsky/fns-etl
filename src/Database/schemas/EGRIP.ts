import * as mongoose from "mongoose"
import { EEgripIndexPaths } from "../indexPaths/EEgripIndexPaths"
const { Schema } = mongoose

// TODO: если схема выписки когда-нибудь будет типизирована, то определить ее как содержимое history
const schema = new Schema({ _id: String, history: [{}] }, { strict: false, collection: "EGRIP", _id: false })

schema.index(
    {
        [EEgripIndexPaths.ogrnip]: "text",
        [EEgripIndexPaths.inn]: "text",
        [EEgripIndexPaths.firstName]: "text",
        [EEgripIndexPaths.secondName]: "text",
        [EEgripIndexPaths.patronymic]: "text",
        [EEgripIndexPaths.region]: "text",
        [EEgripIndexPaths.district]: "text",
        [EEgripIndexPaths.city]: "text",
        [EEgripIndexPaths.town]: "text",
        [EEgripIndexPaths.street]: "text",
    },
    {
        weights: {
            [EEgripIndexPaths.ogrnip]: 10000,
            [EEgripIndexPaths.inn]: 9000,
            [EEgripIndexPaths.secondName]: 8000,
            [EEgripIndexPaths.firstName]: 70,
            [EEgripIndexPaths.patronymic]: 60,
            [EEgripIndexPaths.region]: 50,
            [EEgripIndexPaths.district]: 40,
            [EEgripIndexPaths.city]: 30,
            [EEgripIndexPaths.town]: 20,
            [EEgripIndexPaths.street]: 10,
        },
        default_language: "russian",
    },
)

export default schema
