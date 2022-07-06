import AController from "./AController"
import { NextFunction, Request, Response } from "express"

export default class GetEgripById extends AController {
    public handler = async (req: Request, res: Response, next: NextFunction) => {
        let document
        try {
            document = await this.database.getFromEgrip(req.params["ogrnip"])
        } catch (e) {
            next(e)
        }

        if (document) {
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
            res.end(JSON.stringify(document))
        } else {
            res.status(404).send("Not found")
        }
    }
}
