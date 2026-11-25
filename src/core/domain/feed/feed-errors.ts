export class InvalidFeedSubscriptionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvalidFeedSubscriptionError'
    }
}

export class FeedAlreadySubscribedError extends Error {
    constructor(url: string) {
        super(`Flux déjà ajouté : ${url}`)
        this.name = 'FeedAlreadySubscribedError'
    }
}

export class FeedUnavailableError extends Error {
    constructor(
        url: string,
        readonly reason: string
    ) {
        super(`Flux inaccessible : ${url}`)
        this.name = 'FeedUnavailableError'
    }
}
