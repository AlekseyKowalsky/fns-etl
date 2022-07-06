export default (docArray, score: number) => {
    docArray.forEach((d) => {
        // @ts-ignore
        d._doc.score = score
    })
}
