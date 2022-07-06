import GetEgripByIdController from "./controllers/GetEgripById"
import GetEgrulByIdController from "./controllers/GetEgrulById"
import ListRecordsBySearchController from "./controllers/ListRecordsBySearch"
import controllers from "./controllers"

export interface IRoute {
    method: "get" | "post" | "put" | "delete"
    path: string
    controller: typeof controllers[number]
}

const routes: Array<IRoute> = [
    /**
     * This function comment is parsed by doctrine
     * @route GET /api/egrul/{ogrn}
     * @group EGRUL
     * @param {string} ogrn.path.required - ОГРН Организации
     * @returns {object} 200 - JSON с выпиской
     * @returns {Error}  500 - Unexpected error
     */
    {
        method: "get",
        path: "/api/egrul/:ogrn",
        controller: GetEgrulByIdController,
    },
    /**
     * This function comment is parsed by doctrine
     * @route GET /api/egrip/{ogrnip}
     * @group EGRIP
     * @param {string} ogrnip.path.required - ОГРНИП Предпренимателя
     * @returns {object} 200 - JSON с выпиской
     * @returns {Error}  500 - Unexpected error
     */
    {
        method: "get",
        path: "/api/egrip/:ogrnip",
        controller: GetEgripByIdController,
    },
    /**
     * This function comment is parsed by doctrine
     * @route GET /search/{search_string}
     * @group SEARCH
     * @param {string} search_string.path.required - поисковая строка
     * @queryParam {object} companyStatus param. Example: 0
     * @returns {object} 200 - Массив JSON'ов с выписками
     * @returns {Error}  500 - Unexpected error
     */
    {
        method: "get",
        path: "/api/search/:search_string",
        controller: ListRecordsBySearchController,
    },
]

export default routes
