import vercelKVDriver from "unstorage/drivers/vercel-kv";

export default defineNitroPlugin(() => {
    const storage = useStorage()

    const driver = vercelKVDriver({
        url: useRuntimeConfig().temporaryStorageConnectionUrl, // db host
        token: useRuntimeConfig().temporaryStorageConnectionToken, // db password
    })

    storage.mount('temporary-storage', driver)
})
