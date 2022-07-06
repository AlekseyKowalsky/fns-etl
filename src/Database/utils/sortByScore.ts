// @ts-ignore
export default (docsArray) => docsArray.sort(({ _doc: { score: scoreA } }, { _doc: { score: scoreB } }) => scoreB - scoreA)
