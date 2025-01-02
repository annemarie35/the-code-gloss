export function createFetchResponse(options: Partial<Template> = {}) {
    return {
        json: options.ok ? () => new Promise((resolve) => resolve({ gloses: options.data })) : undefined,
        ok: true,
        status: options.ok ? 200 : 500,
        ...options
    }
}

type Data = Record<string, unknown>[]
type Template = {
    status: number
    ok: boolean
    data?: Data
    json?: (() => Promise<unknown>) | undefined | (() => Data)
}
