import { expect, it, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageLayout from '@/src/pages/pageLayout'

describe('Layout', () => {
    render(
        <PageLayout title="À propos">
            (<div>Dummy</div>)
        </PageLayout>
    )

    it('should contain a custom title', () => {
        expect(screen.getByRole('heading', { level: 1, name: 'À propos' })).toBeDefined()
    })
})
