import EnvVarsDTO from "../Environment/EnvVarsDTO"
import HttpManager from "../HttpManager"
import AbstractFetcher from "./AbstractFetcher"

export default class EGRULFetcher extends AbstractFetcher {
    constructor(_envs: EnvVarsDTO, _ftpManager: HttpManager) {
        super(_envs, _ftpManager)
    }

    public getFullDataIterator() {
        return this.createZipIteratorStreamUpToNow(this._envs.PATH_TO_EGRUL_REGISTER)
    }

    public getTodayDataIterator() {
        return this.createZipIteratorStreamForToday(this._envs.PATH_TO_EGRUL_REGISTER)
    }
}
