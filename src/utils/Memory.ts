import { LoggerConstructor } from "../Logger"

export class Memory {
    static getAllProps() {
        const memoryUsage = process.memoryUsage()
        for (const prop in memoryUsage) {
            memoryUsage[prop] = (memoryUsage[prop] / 1000000000).toFixed(3) + "GB"
        }
        return JSON.stringify(memoryUsage)
    }

    static getHeapTotalNumber() {
        const memoryUsage = process.memoryUsage()
        return +(memoryUsage.heapTotal / 1000000000).toFixed(3)
    }

    static logMemory(logger: LoggerConstructor) {
        logger.verbose(`Memory Usage ---> ${Memory.getAllProps()}`)
        if (Memory.getHeapTotalNumber() > 1) logger.warn("HeapTotal is more than 1 GB")
    }
}
