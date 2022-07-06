import { deepDiffMapper } from "./deepDiffMapper"
import axios from "axios"
import Environment from "../Environment"

type TObject = Record<string, any>

interface IChangesSnapshot {
    companyId: string
    date: string
    snapshot: TObject
}

interface IProduceSnapFnOptions {
    ignoredFields: string[]
}

export class EventManager {
    snapshot!: IChangesSnapshot
    constructor(private id) {}

    public produceChangesSnapshot(oldDoc: TObject, newDoc: TObject, options: IProduceSnapFnOptions): this {
        const { ignoredFields } = options
        this.snapshot = {
            companyId: this.id,
            date: Date.now().toString(),
            snapshot: deepDiffMapper.map(oldDoc, newDoc, ignoredFields),
        }

        return this
    }

    public async send(): Promise<void> {
        const { EVENTS_HOST, EVENTS_PORT, EVENTS_POST_PATH } = new Environment().init().envs
        await axios.post(`http://${EVENTS_HOST}:${EVENTS_PORT}/${EVENTS_POST_PATH}`, this.snapshot)
    }

    get changesAmount() {
        let i = 0
        for (const k in this.snapshot.snapshot) i++
        return i
    }
}
