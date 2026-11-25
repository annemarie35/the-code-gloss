import { describe, expect, it, vi } from 'vitest'
import { container } from '@/src/composition/container'

vi.mock('pg')

describe('container', () => {
    it('should expose a feeds controller wired with its use cases', () => {
        expect(container.feedsController).toEqual({
            list: expect.any(Function),
            subscribe: expect.any(Function),
            unsubscribe: expect.any(Function)
        })
    })
})
