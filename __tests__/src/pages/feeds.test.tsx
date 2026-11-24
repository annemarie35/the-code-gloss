import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import FeedsPage from '@/src/pages/feeds'
import { getFeed } from '@/src/actions/feeds-actions'
import { Feed } from '@/src/core/domain/models/Feed'

vi.mock('@/src/actions/feeds-actions', () => ({
    getFeed: vi.fn()
}))

const getFeedMock = vi.mocked(getFeed)

const STORAGE_KEY = 'rss-feed-urls'
const FEED_A_URL = 'https://a.example.com/feed.xml'
const FEED_B_URL = 'https://b.example.com/feed.xml'

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

const feedsByUrl: Record<string, Feed> = { [FEED_A_URL]: feedA, [FEED_B_URL]: feedB }

async function addFeed(url: string) {
    await userEvent.type(screen.getByPlaceholderText('https://example.com/feed.xml'), url)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
}

function savedUrls() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
}

describe('Feeds page', () => {
    beforeEach(() => {
        localStorage.clear()
        getFeedMock.mockReset()
        getFeedMock.mockImplementation(async (url) => ({ feed: feedsByUrl[url], error: null }))
    })

    describe('initial render', () => {
        beforeEach(() => {
            render(<FeedsPage />)
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

        it('should display an empty state message when no feeds are added', () => {
            expect(screen.getByText('Ajoutez une URL de flux RSS pour afficher les articles.')).toBeDefined()
        })

        it('should not load any feed when nothing is saved', () => {
            expect(getFeedMock).not.toHaveBeenCalled()
        })

        it('should not display the loading message when no feed is added', () => {
            expect(screen.queryByText('Chargement des articles...')).not.toBeInTheDocument()
        })
    })

    it('should load the feeds saved in localStorage on mount', async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([FEED_A_URL, FEED_B_URL]))

        render(<FeedsPage />)

        expect(await screen.findByText('Article A')).toBeInTheDocument()
        expect(await screen.findByText('Article B')).toBeInTheDocument()
        expect(getFeedMock).toHaveBeenCalledWith(FEED_A_URL)
        expect(getFeedMock).toHaveBeenCalledWith(FEED_B_URL)
        expect(screen.getByText(FEED_A_URL)).toBeInTheDocument()
    })

    it('should display each saved feed only once when the mount effect runs twice', async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([FEED_A_URL]))

        render(
            <React.StrictMode>
                <FeedsPage />
            </React.StrictMode>
        )

        await waitFor(() => expect(getFeedMock).toHaveBeenCalledTimes(2))
        expect(await screen.findAllByText('Article A')).toHaveLength(1)
    })

    describe('adding a feed', () => {
        it('should fetch the feed, save its url and clear the input', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(getFeedMock).toHaveBeenCalledWith(FEED_A_URL)
            expect(savedUrls()).toEqual([FEED_A_URL])
            expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toHaveValue('')
            expect(screen.getByText(FEED_A_URL)).toBeInTheDocument()
            expect(
                screen.queryByText('Ajoutez une URL de flux RSS pour afficher les articles.')
            ).not.toBeInTheDocument()
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
            expect(savedUrls()).toEqual([FEED_A_URL, FEED_B_URL])
        })

        it('should display a loading message while the feed is being fetched', async () => {
            getFeedMock.mockReturnValue(new Promise(() => {}))
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(screen.getByText('Chargement des articles...')).toBeInTheDocument()
            expect(
                screen.queryByText('Ajoutez une URL de flux RSS pour afficher les articles.')
            ).not.toBeInTheDocument()
        })

        it('should ignore a url that is already added', async () => {
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)
            await addFeed(FEED_A_URL)

            expect(getFeedMock).toHaveBeenCalledOnce()
            expect(screen.getAllByText(FEED_A_URL)).toHaveLength(1)
            expect(savedUrls()).toEqual([FEED_A_URL])
        })

        it('should ignore an empty url', () => {
            render(<FeedsPage />)

            fireEvent.submit(screen.getByRole('button', { name: 'Ajouter' }).closest('form')!)

            expect(getFeedMock).not.toHaveBeenCalled()
            expect(savedUrls()).toBeNull()
        })

        it('should display an error when the feed cannot be fetched', async () => {
            getFeedMock.mockResolvedValue({ feed: null, error: 'Une erreur est survenue en récupérant le flux' })
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText(`Impossible de charger : ${FEED_A_URL}`)).toBeInTheDocument()
        })

        it('should display an error when no feed is returned', async () => {
            getFeedMock.mockResolvedValue({ feed: null, error: null })
            render(<FeedsPage />)

            await addFeed(FEED_A_URL)

            expect(await screen.findByText(`Impossible de charger : ${FEED_A_URL}`)).toBeInTheDocument()
        })
    })

    describe('removing a feed', () => {
        it('should remove only that feed, its articles and its saved url', async () => {
            render(<FeedsPage />)
            await addFeed(FEED_A_URL)
            await addFeed(FEED_B_URL)
            await screen.findByText('Article B')

            await userEvent.click(screen.getByRole('button', { name: `Supprimer ${FEED_A_URL}` }))

            await waitFor(() => expect(screen.queryByText('Article A')).not.toBeInTheDocument())
            expect(screen.queryByText(FEED_A_URL)).not.toBeInTheDocument()
            expect(screen.getByText('Article B')).toBeInTheDocument()
            expect(screen.getByText(FEED_B_URL)).toBeInTheDocument()
            expect(savedUrls()).toEqual([FEED_B_URL])
        })
    })
})
