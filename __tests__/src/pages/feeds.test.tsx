import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import FeedsPage from '@/src/pages/feeds'
import { getFeedItems, listFeedSubscriptions, subscribeToFeed, unsubscribeFromFeed } from '@/src/client/api/feeds-api'
import { Feed } from '@/src/core/domain/models/Feed'

vi.mock('@/src/client/api/feeds-api', () => ({
    getFeedItems: vi.fn(),
    listFeedSubscriptions: vi.fn(),
    subscribeToFeed: vi.fn(),
    unsubscribeFromFeed: vi.fn()
}))

const getFeedItemsMock = vi.mocked(getFeedItems)
const listFeedSubscriptionsMock = vi.mocked(listFeedSubscriptions)
const subscribeToFeedMock = vi.mocked(subscribeToFeed)
const unsubscribeFromFeedMock = vi.mocked(unsubscribeFromFeed)

const FEED_A_URL = 'https://a.example.com/feed.xml'
const FEED_B_URL = 'https://b.example.com/feed.xml'
const CREATED_AT = '2026-11-25T10:00:00.000Z'
const subscriptionA = { id: 1, url: FEED_A_URL, createdAt: CREATED_AT }
const subscriptionB = { id: 2, url: FEED_B_URL, createdAt: CREATED_AT }

const feedA: Feed = {
    title: 'Blog A',
    items: [
        {
            title: 'Article A',
            description: 'Description A',
            link: 'https://a.example.com/article',
            pubDate: '2025-03-15T10:00:00Z'
        }
    ]
}

const feedB: Feed = {
    title: 'Blog B',
    items: [{ title: 'Article B', description: '', link: '', pubDate: '' }]
}

const feedsById: Record<number, Feed> = { [subscriptionA.id]: feedA, [subscriptionB.id]: feedB }
const idsByUrl: Record<string, number> = { [FEED_A_URL]: subscriptionA.id, [FEED_B_URL]: subscriptionB.id }

async function addFeed(url: string) {
    await userEvent.type(screen.getByPlaceholderText('https://example.com/feed.xml'), url)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
}

describe('Feeds page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getFeedItemsMock.mockImplementation(async (id) => ({ feed: feedsById[id], error: null }))
        listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [], error: null })
        let nextId = 100
        subscribeToFeedMock.mockImplementation(async (url) => ({
            subscription: { id: idsByUrl[url] ?? nextId++, url, createdAt: CREATED_AT },
            error: null
        }))
        unsubscribeFromFeedMock.mockResolvedValue({ error: null })
    })

    describe('initial render', () => {
        beforeEach(async () => {
            render(<FeedsPage />)
            await waitFor(() => expect(listFeedSubscriptionsMock).toHaveBeenCalled())
        })

        it('should render the Feeds page heading', () => {
            expect(screen.getByRole('heading', { level: 2, name: 'Flux RSS importes' })).toBeDefined()
        })

        it('should display the feed URL input', () => {
            expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toBeDefined()
        })

        it('should display the add button', () => {
            expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDefined()
        })

        it('should display an empty state message when no feeds are saved', () => {
            expect(screen.getByText('Ajoutez une URL de flux RSS pour afficher les articles.')).toBeDefined()
        })

        it('should not load any feed when nothing is saved', () => {
            expect(getFeedItemsMock).not.toHaveBeenCalled()
        })

        it('should not display the loading message when no feed is saved', () => {
            expect(screen.queryByText('Chargement des articles...')).not.toBeInTheDocument()
        })
    })

    describe('saved feeds', () => {
        it('should load the saved feeds and their articles on mount', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [subscriptionA, subscriptionB], error: null })

            render(<FeedsPage />)

            expect(await screen.findByText('Article A')).toBeInTheDocument()
            expect(await screen.findByText('Article B')).toBeInTheDocument()
            expect(getFeedItemsMock).toHaveBeenCalledWith(subscriptionA.id)
            expect(getFeedItemsMock).toHaveBeenCalledWith(subscriptionB.id)
            expect(screen.getByText(FEED_A_URL)).toBeInTheDocument()
        })

        it('should not use localStorage anymore', async () => {
            const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

            render(<FeedsPage />)

            await waitFor(() => expect(listFeedSubscriptionsMock).toHaveBeenCalled())
            expect(getItemSpy).not.toHaveBeenCalled()
            getItemSpy.mockRestore()
        })

        it('should display each saved feed only once when the mount effect runs twice', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [subscriptionA], error: null })

            render(
                <React.StrictMode>
                    <FeedsPage />
                </React.StrictMode>
            )

            await waitFor(() => expect(getFeedItemsMock).toHaveBeenCalledTimes(2))
            expect(await screen.findAllByText('Article A')).toHaveLength(1)
            expect(screen.getAllByText(FEED_A_URL)).toHaveLength(1)
        })

        it('should display an error when the saved feeds cannot be listed', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({
                subscriptions: [],
                error: 'Une erreur est survenue en récupérant vos flux'
            })

            render(<FeedsPage />)

            expect(await screen.findByText('Une erreur est survenue en récupérant vos flux')).toBeInTheDocument()
        })
    })

    describe('adding a feed', () => {
        it('should save the feed, fetch it and clear the input', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(subscribeToFeedMock).toHaveBeenCalledWith(FEED_A_URL)
            expect(getFeedItemsMock).toHaveBeenCalledWith(subscriptionA.id)
            expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toHaveValue('')
            expect(await screen.findByText(FEED_A_URL)).toBeInTheDocument()
            expect(
                screen.queryByText('Ajoutez une URL de flux RSS pour afficher les articles.')
            ).not.toBeInTheDocument()
        })

        it('should trim the url before saving it', async () => {
            render(<FeedsPage />)

            await addFeed(`  ${FEED_A_URL}  `)

            expect(subscribeToFeedMock).toHaveBeenCalledWith(FEED_A_URL)
        })

        it('should display the feed articles with their feed title, date and link', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText('Article A')).toBeInTheDocument()
            expect(screen.getByText('Blog A')).toBeInTheDocument()
            expect(screen.getByText('Description A')).toBeInTheDocument()
            expect(screen.getByText('15/03/2025')).toBeInTheDocument()
            const link = screen.getByRole('link', { name: /Lire/ })
            expect(link).toHaveAttribute('href', 'https://a.example.com/article')
            expect(link).toHaveAttribute('target', '_blank')
            expect(screen.queryByText('Chargement des articles...')).not.toBeInTheDocument()
        })

        it('should prevent the browser from submitting the form', async () => {
            render(<FeedsPage />)
            await userEvent.type(screen.getByPlaceholderText('https://example.com/feed.xml'), FEED_A_URL)

            const notPrevented = fireEvent.submit(screen.getByRole('button', { name: 'Ajouter' }).closest('form')!)

            expect(notPrevented).toBe(false)
        })

        it('should not display description, date or link when the article has none', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_B_URL)

            expect(await screen.findByText('Article B')).toBeInTheDocument()
            expect(screen.queryByRole('link', { name: /Lire/ })).not.toBeInTheDocument()
            expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument()
        })

        it('should display articles from every added feed', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)
            await addFeed(FEED_B_URL)

            expect(await screen.findByText('Article A')).toBeInTheDocument()
            expect(await screen.findByText('Article B')).toBeInTheDocument()
            expect(subscribeToFeedMock).toHaveBeenCalledTimes(2)
        })

        it('should display a loading message while the feed is being fetched', async () => {
            getFeedItemsMock.mockReturnValue(new Promise(() => {}))
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText('Chargement des articles...')).toBeInTheDocument()
            expect(
                screen.queryByText('Ajoutez une URL de flux RSS pour afficher les articles.')
            ).not.toBeInTheDocument()
        })

        it('should refuse a url that is already saved', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)
            await screen.findByText('Article A')
            await addFeed(FEED_A_URL)

            expect(await screen.findByText(`Flux déjà ajouté : ${FEED_A_URL}`)).toBeInTheDocument()
            expect(subscribeToFeedMock).toHaveBeenCalledOnce()
            expect(getFeedItemsMock).toHaveBeenCalledOnce()
            expect(screen.getAllByText(FEED_A_URL)).toHaveLength(1)
        })

        it('should refuse a url equivalent to one already saved', async () => {
            render(<FeedsPage />)
            await addFeed(FEED_A_URL)
            await screen.findByText('Article A')

            await addFeed('HTTPS://A.Example.com:443/feed.xml')

            expect(await screen.findByText(`Flux déjà ajouté : ${FEED_A_URL}`)).toBeInTheDocument()
            expect(subscribeToFeedMock).toHaveBeenCalledOnce()
        })

        it('should clear the previous error when a feed is added', async () => {
            render(<FeedsPage />)
            await addFeed(FEED_A_URL)
            await screen.findByText('Article A')
            await addFeed(FEED_A_URL)
            await screen.findByText(`Flux déjà ajouté : ${FEED_A_URL}`)

            await addFeed(FEED_B_URL)

            await waitFor(() => expect(screen.queryByText(`Flux déjà ajouté : ${FEED_A_URL}`)).not.toBeInTheDocument())
        })

        it('should ignore an empty url', () => {
            render(<FeedsPage />)

            fireEvent.submit(screen.getByRole('button', { name: 'Ajouter' }).closest('form')!)

            expect(subscribeToFeedMock).not.toHaveBeenCalled()
            expect(getFeedItemsMock).not.toHaveBeenCalled()
        })

        it('should keep the url in the input and display the error when the feed cannot be saved', async () => {
            subscribeToFeedMock.mockResolvedValue({
                subscription: null,
                error: "Une erreur est survenue dans l'ajout du flux"
            })
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText("Une erreur est survenue dans l'ajout du flux")).toBeInTheDocument()
            expect(getFeedItemsMock).not.toHaveBeenCalled()
            expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toHaveValue(FEED_A_URL)
            expect(screen.getByText('Ajoutez une URL de flux RSS pour afficher les articles.')).toBeInTheDocument()
        })

        it('should display an error when the feed cannot be fetched', async () => {
            getFeedItemsMock.mockResolvedValue({ feed: null, error: 'Une erreur est survenue en récupérant le flux' })
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText(`Impossible de charger : ${FEED_A_URL}`)).toBeInTheDocument()
        })

        it('should display an error when no feed is returned', async () => {
            getFeedItemsMock.mockResolvedValue({ feed: null, error: null })
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText(`Impossible de charger : ${FEED_A_URL}`)).toBeInTheDocument()
        })
    })

    describe('removing a feed', () => {
        it('should delete only that feed, its articles and its url', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [subscriptionA, subscriptionB], error: null })
            render(<FeedsPage />)
            await screen.findByText('Article A')
            await screen.findByText('Article B')

            await userEvent.click(screen.getByRole('button', { name: `Supprimer ${FEED_A_URL}` }))

            expect(unsubscribeFromFeedMock).toHaveBeenCalledWith(subscriptionA.id)
            await waitFor(() => expect(screen.queryByText('Article A')).not.toBeInTheDocument())
            expect(screen.queryByText(FEED_A_URL)).not.toBeInTheDocument()
            expect(screen.getByText('Article B')).toBeInTheDocument()
            expect(screen.getByText(FEED_B_URL)).toBeInTheDocument()
        })

        it('should not display a feed removed while it was still loading', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [subscriptionA, subscriptionB], error: null })
            let resolveFeedA: (response: { feed: Feed; error: null }) => void = () => {}
            getFeedItemsMock.mockImplementation((id) =>
                id === subscriptionA.id
                    ? new Promise((resolve) => (resolveFeedA = resolve))
                    : Promise.resolve({ feed: feedsById[id], error: null })
            )
            render(<FeedsPage />)
            await screen.findByText('Article B')

            await userEvent.click(screen.getByRole('button', { name: `Supprimer ${FEED_A_URL}` }))
            await waitFor(() => expect(screen.queryByText(FEED_A_URL)).not.toBeInTheDocument())
            resolveFeedA({ feed: feedA, error: null })

            await waitFor(() => expect(getFeedItemsMock).toHaveBeenCalledWith(subscriptionA.id))
            await new Promise((resolve) => setTimeout(resolve, 0))
            expect(screen.queryByText('Article A')).not.toBeInTheDocument()
            expect(screen.getByText('Article B')).toBeInTheDocument()
        })

        it('should keep the feed and display the error when it cannot be deleted', async () => {
            listFeedSubscriptionsMock.mockResolvedValue({ subscriptions: [subscriptionA], error: null })
            unsubscribeFromFeedMock.mockResolvedValue({ error: 'Une erreur est survenue dans la suppression du flux' })
            render(<FeedsPage />)
            await screen.findByText('Article A')

            await userEvent.click(screen.getByRole('button', { name: `Supprimer ${FEED_A_URL}` }))

            expect(await screen.findByText('Une erreur est survenue dans la suppression du flux')).toBeInTheDocument()
            expect(screen.getByText('Article A')).toBeInTheDocument()
            expect(screen.getByText(FEED_A_URL)).toBeInTheDocument()
        })
    })
})
