export class Size {
    static measureJSONSizeMB(item: unknown) {
        return Buffer.from(JSON.stringify(item)).length / 1000000
    }
}
