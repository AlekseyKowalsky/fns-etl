export default function() {
    const currentDay = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate()
    const currentMonth = ("0" + (new Date().getMonth() + 1)).slice(-2)
    const currentYear = new Date().getFullYear()

    return `${currentDay}.${currentMonth}.${currentYear}`
}
