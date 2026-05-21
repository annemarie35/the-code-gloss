import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeFilter from '@/src/components/theme-filter'
import { THEMES, Theme } from '@/src/core/domain/models/Glose'

describe('ThemeFilter', () => {
    it('devrait afficher un bouton pour chaque thème', () => {
        render(<ThemeFilter selectedThemes={[]} onToggle={vi.fn()} />)
        THEMES.forEach((theme) => {
            expect(screen.getByRole('button', { name: theme })).toBeInTheDocument()
        })
    })

    it('devrait marquer les thèmes sélectionnés avec aria-pressed=true', () => {
        render(<ThemeFilter selectedThemes={['CRAFT', 'OPS']} onToggle={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'CRAFT' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'OPS' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'AGILE' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('devrait appeler onToggle avec le thème cliqué', async () => {
        const onToggle = vi.fn()
        render(<ThemeFilter selectedThemes={[]} onToggle={onToggle} />)
        await userEvent.click(screen.getByRole('button', { name: 'CRAFT' }))
        expect(onToggle).toHaveBeenCalledWith('CRAFT')
    })

    it('devrait appeler onToggle pour désélectionner un thème actif', async () => {
        const onToggle = vi.fn()
        render(<ThemeFilter selectedThemes={['AGILE']} onToggle={onToggle} />)
        await userEvent.click(screen.getByRole('button', { name: 'AGILE' }))
        expect(onToggle).toHaveBeenCalledWith('AGILE')
    })

    it('devrait appliquer le style actif sur les thèmes sélectionnés', () => {
        render(<ThemeFilter selectedThemes={['DATABASE'] as Theme[]} onToggle={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'DATABASE' })).toHaveClass('bg-gray-800')
        expect(screen.getByRole('button', { name: 'OPS' })).toHaveClass('bg-white')
    })
})
