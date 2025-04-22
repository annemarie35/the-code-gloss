import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GlossTermsList from '@/src/components/gloss-terms-list'

describe('Gloss terms List', () => {
    describe('Displays a gloses list', () => {
        beforeEach(() => {
            render(<GlossTermsList loading={false} glosesList={[]} error={''} />)
        })

        it('should contain a title for gloses section', () => {
            expect(screen.getByRole('heading', { level: 3, name: 'Gloses' })).toBeDefined()
        })

        it('do not display a waiting message by default', () => {
            expect(screen.queryByText(/Chargement des données en cours/i)).not.toBeInTheDocument()
        })
    })

    describe('When gloses are not loaded yet', () => {
        beforeEach(() => {
            render(<GlossTermsList loading={true} glosesList={[]} error={'Une erreur est survenue.'} />)
        })

        it('display a waiting message', () => {
            expect(screen.queryByText(/Chargement des données en cours/i)).toBeInTheDocument()
        })

        it('should display an error message', () => {
            expect(screen.getByText(/Une erreur est survenue./i)).toBeInTheDocument()
        })
    })
})
