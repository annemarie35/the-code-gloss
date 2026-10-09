import { describe, expect, it } from 'vitest'
import viceConfig from '@/vice.config.mjs'

describe('Vice config', () => {
    describe('transformFinding', () => {
        it.each(['braces', 'micromatch', 'fast-glob', 'next-eslint-plugin-next', 'eslint-config-next'])(
            'should downgrade the accepted %s advisory to INFO',
            (name) => {
                const finding = {
                    severity: 'HIGH',
                    module: 'Dependencies',
                    title: `${name} has a high npm advisory`,
                    detail: 'Dependency type: transitive',
                    rule_id: `vice/dependencies/npm-advisory/${name}`
                }

                expect(viceConfig.transformFinding(finding)).toEqual({
                    ...finding,
                    severity: 'INFO',
                    detail: 'Dependency type: transitive\nAccepted risk: dev-only lint tooling, no patched release.'
                })
            }
        )

        it('should keep other npm advisories unchanged', () => {
            const finding = {
                severity: 'HIGH',
                module: 'Dependencies',
                title: 'next has a high npm advisory',
                detail: 'Dependency type: direct',
                rule_id: 'vice/dependencies/npm-advisory/next'
            }

            expect(viceConfig.transformFinding(finding)).toBe(finding)
        })

        it('should keep findings without a rule id unchanged', () => {
            const finding = { severity: 'CRITICAL', module: 'Code Secrets', title: 'Hardcoded API key' }

            expect(viceConfig.transformFinding(finding)).toBe(finding)
        })
    })
})
