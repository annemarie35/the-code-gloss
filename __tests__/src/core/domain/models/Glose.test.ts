import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { THEMES, areValidThemes, isTheme } from '@/src/core/domain/models/Glose'

describe('isTheme', () => {
    it('should accept a known theme', () => {
        expect(isTheme('TEST')).toBe(true)
    })

    it.each([['test'], ['FOO'], [42], [null]])('should reject %s', (value) => {
        expect(isTheme(value)).toBe(false)
    })
})

describe('areValidThemes', () => {
    it('should accept missing themes', () => {
        expect(areValidThemes(undefined)).toBe(true)
    })

    it('should accept an empty list or a list of known themes', () => {
        expect(areValidThemes([])).toBe(true)
        expect(areValidThemes(['TEST', 'CRAFT'])).toBe(true)
    })

    it('should reject a list containing an unknown theme', () => {
        expect(areValidThemes(['CRAFT', 'FOO'])).toBe(false)
    })

    it('should reject a value that is not a list', () => {
        expect(areValidThemes('CRAFT')).toBe(false)
    })
})

describe('THEMES', () => {
    it('should match the themes allowed by the gloses_themes_check constraint', () => {
        const sql = readFileSync(resolve('infra/database/scripts/migrations.sql'), 'utf-8')
        const constraint = sql.match(/ADD CONSTRAINT gloses_themes_check[\s\S]*?ARRAY\s*\[([^\]]*)\]/)

        expect(constraint).not.toBeNull()
        const allowedThemes = constraint![1].split(',').map((theme) =>
            theme
                .replace(/::text/g, '')
                .replace(/'/g, '')
                .trim()
        )
        expect([...allowedThemes].sort()).toEqual([...THEMES].sort())
    })

    it('should cover every theme used in seeds.json', () => {
        const seeds = JSON.parse(readFileSync(resolve('infra/database/seeds/seeds.json'), 'utf-8'))
        const seededThemes: string[] = seeds.gloses.flatMap((glose: { themes?: string[] }) => glose.themes ?? [])

        seededThemes.forEach((theme) => expect(THEMES).toContain(theme))
    })
})
