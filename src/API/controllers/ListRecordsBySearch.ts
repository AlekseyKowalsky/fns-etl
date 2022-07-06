import AController from "./AController"
import { NextFunction, Request, Response } from "express"
import { assign } from "lodash"
import { SearchFilters } from "src/Database"

export default class ListRecordsBySearch extends AController {
    public handler = async (req: Request, res: Response, next: NextFunction) => {
        let documents
        const { egrulStatus } = req.query

        const filters = assign({}, egrulStatus && { egrulStatus: Number(egrulStatus) }) as SearchFilters

        try {
            ;({ documents } = await this.database.search({
                searchString: req.params["search_string"],
                filters,
            }))
        } catch (e) {
            next(e)
        }

        if (documents) {
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
            })
            res.end(JSON.stringify({ data: documents, amount: documents.length }))
        } else {
            res.status(404).send("Not found")
        }
    }
}
