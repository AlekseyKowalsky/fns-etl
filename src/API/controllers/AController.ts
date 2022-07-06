import Database from "../../Database"
import { NextFunction, Request, Response } from "express"

export type THandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export default abstract class AController {
    constructor(public database: Database) {}

    public abstract handler: THandler
}
