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
