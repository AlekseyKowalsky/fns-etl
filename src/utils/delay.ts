export default async (timeoutMS: number) =>
    await new Promise((res) => {
        setTimeout(() => res(true), timeoutMS)
    })
