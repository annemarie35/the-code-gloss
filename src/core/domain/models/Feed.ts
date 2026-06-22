export type FeedItem = {
    title: string
    description: string
    link: string
    pubDate: string
}

export type Feed = {
    title: string
    items: FeedItem[]
}
