export interface FeedReader {
    /** Raw document of the feed. Throws FeedUnavailableError when it cannot or must not be read. */
    read(url: string): Promise<string>
}
