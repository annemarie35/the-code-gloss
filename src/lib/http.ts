import { pino, type Logger } from 'pino'

const logger: Logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    level: process.env.PINO_LOG_LEVEL || 'info',
    redact: [] // prevent logging of sensitive data
})

export const httpClient = async ({ url, requestConfig }: HttpClient) => {
    try {
        const response = await fetch(url, requestConfig)
        console.log(`HTTP response: ${JSON.stringify(response)}`)

        if (response.ok) {
            return await response.json()
        } else {
            // TODO something to manage properly errors code https://github.com/annemarie35/the-code-gloss/issues/10
        }
    } catch (error) {
        logger.error(error)
    }
}

type HttpClient = {
    url: string
    requestConfig: {
        method: 'POST' | 'GET'
        headers: Headers
        mode: 'cors'
        body?: BodyInit
    }
}
