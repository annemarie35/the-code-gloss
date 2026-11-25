import { describe, expect, it, vi } from 'vitest'
import { feedsController } from '@/src/adapters/api/feeds-controller'
import { FeedAlreadySubscribedError, InvalidFeedSubscriptionError } from '@/src/core/domain/feed/feed-errors'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'

const subscription = {
    id: 1,
    url: 'https://blog.example.com/feed.xml',
    createdAt: new Date('2026-11-25T10:00:00.000Z')
}
const subscriptionDto = { id: 1, url: 'https://blog.example.com/feed.xml', createdAt: '2026-11-25T10:00:00.000Z' }

const buildController = (overrides: Partial<Parameters<typeof feedsController>[0]> = {}) => {
    const deps = {
        subscribeToFeed: vi.fn().mockResolvedValue(subscription),
        listFeedSubscriptions: vi.fn().mockResolvedValue([subscription]),
        unsubscribeFromFeed: vi.fn().mockResolvedValue(undefined),
        ...overrides
    }
    return { deps, controller: feedsController(deps) }
}

describe('feedsController', () => {
    describe('list', () => {
        it('should return 200 with the subscriptions as DTOs', async () => {
            const { controller } = buildController()
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.list({}, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith({ message: 'Voici vos flux', subscriptions: [subscriptionDto] })
        })

        it('should return 500 when listing fails', async () => {
            const { controller } = buildController({ listFeedSubscriptions: vi.fn().mockRejectedValue(new Error()) })
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.list({}, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(json).toHaveBeenCalledWith({ error: 'Erreur interne' })
        })
    })

    describe('subscribe', () => {
        it('should return 201 with the created subscription', async () => {
            const { controller, deps } = buildController()
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body: '{"url":"https://blog.example.com/feed.xml"}' }, res)

            expect(deps.subscribeToFeed).toHaveBeenCalledWith('https://blog.example.com/feed.xml')
            expect(res.status).toHaveBeenCalledWith(201)
            expect(json).toHaveBeenCalledWith({ message: 'Flux ajouté avec succès', subscription: subscriptionDto })
        })

        it('should accept a body already parsed by Next', async () => {
            const { controller, deps } = buildController()
            const { res } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body: { url: 'https://blog.example.com/feed.xml' } }, res)

            expect(deps.subscribeToFeed).toHaveBeenCalledWith('https://blog.example.com/feed.xml')
            expect(res.status).toHaveBeenCalledWith(201)
        })

        it.each([
            ['an invalid JSON body', '{"url":'],
            ['a body without url', '{}'],
            ['a non string url', '{"url":42}'],
            ['a JSON null body', 'null'],
            ['no body', undefined]
        ])('should return 400 for %s', async (_label, body) => {
            const { controller, deps } = buildController()
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body }, res)

            expect(deps.subscribeToFeed).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Le champ url est obligatoire' })
        })

        it('should return 400 with the domain message when the url is invalid', async () => {
            const { controller } = buildController({
                subscribeToFeed: vi
                    .fn()
                    .mockRejectedValue(new InvalidFeedSubscriptionError('Seules les URLs http et https sont acceptées'))
            })
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body: '{"url":"ftp://example.com"}' }, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Seules les URLs http et https sont acceptées' })
        })

        it('should return 409 when the feed is already subscribed', async () => {
            const { controller } = buildController({
                subscribeToFeed: vi
                    .fn()
                    .mockRejectedValue(new FeedAlreadySubscribedError('https://blog.example.com/feed.xml'))
            })
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body: '{"url":"https://blog.example.com/feed.xml"}' }, res)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(json).toHaveBeenCalledWith({ error: 'Flux déjà ajouté : https://blog.example.com/feed.xml' })
        })

        it('should return 500 on an unexpected error', async () => {
            const { controller } = buildController({ subscribeToFeed: vi.fn().mockRejectedValue(new Error('db down')) })
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.subscribe({ body: '{"url":"https://blog.example.com/feed.xml"}' }, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(json).toHaveBeenCalledWith({ error: 'Erreur interne' })
        })
    })

    describe('unsubscribe', () => {
        it('should return 200 after deleting the subscription', async () => {
            const { controller, deps } = buildController()
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.unsubscribe({ query: { id: '12' } }, res)

            expect(deps.unsubscribeFromFeed).toHaveBeenCalledWith(12)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith({ message: 'Flux supprimé avec succès' })
        })

        it.each([['abc'], ['12abc'], ['-1'], ['0'], ['1.5'], [''], [undefined], [['1', '2']]])(
            'should return 400 when the id is %j',
            async (id) => {
                const { controller, deps } = buildController()
                const { res, json } = createMockApiResponse()

                // @ts-expect-error -- partial request and response mocks
                await controller.unsubscribe({ query: { id } }, res)

                expect(deps.unsubscribeFromFeed).not.toHaveBeenCalled()
                expect(res.status).toHaveBeenCalledWith(400)
                expect(json).toHaveBeenCalledWith({ error: 'Invalid id' })
            }
        )

        it('should return 500 when the deletion fails', async () => {
            const { controller } = buildController({ unsubscribeFromFeed: vi.fn().mockRejectedValue(new Error()) })
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request and response mocks
            await controller.unsubscribe({ query: { id: '12' } }, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(json).toHaveBeenCalledWith({ error: 'Erreur interne' })
        })
    })
})
