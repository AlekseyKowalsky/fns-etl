const momentIterator = require("moment-iterator")

export default () => {
    const start = new Date(new Date().getFullYear(), 0, 1)
    const end = new Date()

    const dateArray: Array<string> = []

    momentIterator(start, end).each(
        "days",
        function(d: { format: any }) {
            dateArray.push(d.format("DD.MM.YYYY"))
        },
        {
            toDate: false,
        },
    )

    return dateArray
}
