import { EnvList } from "./EnvList"
import { ELogLevels } from "../Logger"

export default class EnvVarsDTO {
    ENV: EnvList = EnvList.local
    LOG_LEVEL: ELogLevels = ELogLevels.ERROR

    PORT: string = ""
    HOST: string = ""

    PATH_TO_EGRUL_REGISTER: string = ""
    PATH_TO_EGRIP_REGISTER: string = ""

    SOURCE_HOST: string = ""
    SSL_CERT_PASSPHRASE: string = ""

    START_UPLOADING_FULL_YEAR: string = ""
    START_UPLOADING_DATE: string = "" // format DD.MM.YYYY
    START_ZIP: string = "none"

    MONGO_DB_NAME: string = ""
    MONGO_USER: string = ""
    MONGO_PASSWORD: string = ""
    MONGO_HOST: string = ""
    MONGO_PORT: string = ""
    MONGO_CONNECTION_PARAMS: string = ""

    UPDATE_MODE = ""
    CRON_UPDATE_PATTERN = ""

    API_SECRET = ""

    EMIT_EVENT = 0
    EVENTS_HOST = ""
    EVENTS_PORT = ""
    EVENTS_POST_PATH = ""
}
