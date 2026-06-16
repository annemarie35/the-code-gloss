import { describe, expect, it, vi } from 'vitest'
import pkg from 'pg'
const { Pool } = pkg

import * as mod from '@/infra/repositories/person_repository'
import { getPeopleInMemory } from '@/src/lib/service/get-people'

vi.mock('pg', () => {
    const mockQuery = vi.fn().mockReturnValue({
        rows: [
            {
                id: 1,
                first_name: 'Ada',
                last_name: 'Lovelace',
                nickname: 'ada_codes',
                blog_url: 'https://ada.dev',
                linkedin_url: 'https://linkedin.com/in/ada',
                biography: 'First programmer',
                year_of_birth: 1815,
                tags: 'pioneer, math',
                created_at: '2000-02-01T12:00:00.000Z'
            }
        ]
    })
    const MockPool = vi.fn(function () {
        return { query: mockQuery }
    })

    const pkg = { Pool: MockPool }

    return {
        default: pkg,
        Pool: MockPool
    }
})

describe('Get people', () => {
    it('Should get all people', async () => {
        const getPeopleDbQuerySpy = vi.spyOn(mod, 'selectAllPeople')
        const people = await getPeopleInMemory()

        expect(Pool).toBeCalledTimes(1)

        expect(getPeopleDbQuerySpy).toHaveBeenCalledOnce()
        expect(people).toEqual([
            {
                id: 1,
                first_name: 'Ada',
                last_name: 'Lovelace',
                nickname: 'ada_codes',
                blog_url: 'https://ada.dev',
                linkedin_url: 'https://linkedin.com/in/ada',
                biography: 'First programmer',
                year_of_birth: 1815,
                tags: 'pioneer, math',
                created_at: '2000-02-01T12:00:00.000Z'
            }
        ])
    })
})
