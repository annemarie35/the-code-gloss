import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemePill } from '@/src/components/ui/theme-pill'

describe('ThemePill', () => {
    describe('sans onClick', () => {
        it('devrait afficher le thème dans un span non interactif', () => {
            render(<ThemePill theme="CRAFT" />)

            const pill = screen.getByText('CRAFT')
            expect(pill.tagName).toBe('SPAN')
            expect(screen.queryByRole('button')).not.toBeInTheDocument()
        })

        it('devrait appliquer le style non sélectionné par défaut, sans effet de survol', () => {
            render(<ThemePill theme="CRAFT" />)

            const pill = screen.getByText('CRAFT')
            expect(pill).toHaveClass('bg-white', 'rounded-full')
            expect(pill).not.toHaveClass('hover:border-gray-500')
        })

        it('devrait appliquer le style sélectionné quand isSelected est vrai', () => {
            render(<ThemePill theme="CRAFT" isSelected />)

            expect(screen.getByText('CRAFT')).toHaveClass('bg-gray-800', 'text-white')
        })
    })

    describe('avec onClick', () => {
        it('devrait afficher un bouton de type button', () => {
            render(<ThemePill theme="OPS" onClick={vi.fn()} />)

            expect(screen.getByRole('button', { name: 'OPS' })).toHaveAttribute('type', 'button')
        })

        it('devrait refléter isSelected dans aria-pressed', () => {
            const { rerender } = render(<ThemePill theme="OPS" onClick={vi.fn()} />)
            expect(screen.getByRole('button', { name: 'OPS' })).toHaveAttribute('aria-pressed', 'false')

            rerender(<ThemePill theme="OPS" isSelected onClick={vi.fn()} />)
            expect(screen.getByRole('button', { name: 'OPS' })).toHaveAttribute('aria-pressed', 'true')
        })

        it('devrait appeler onClick avec le thème au clic', async () => {
            const onClick = vi.fn()
            render(<ThemePill theme="AGILE" onClick={onClick} />)

            await userEvent.click(screen.getByRole('button', { name: 'AGILE' }))

            expect(onClick).toHaveBeenCalledWith('AGILE')
        })

        it("devrait avoir un effet de survol uniquement quand il n'est pas sélectionné", () => {
            const { rerender } = render(<ThemePill theme="OPS" onClick={vi.fn()} />)
            expect(screen.getByRole('button')).toHaveClass('hover:border-gray-500')

            rerender(<ThemePill theme="OPS" isSelected onClick={vi.fn()} />)
            expect(screen.getByRole('button')).not.toHaveClass('hover:border-gray-500')
        })

        it('ne devrait avoir que les classes de base et de sélection quand il est sélectionné', () => {
            render(<ThemePill theme="OPS" isSelected onClick={vi.fn()} />)

            expect(screen.getByRole('button')).toHaveClass(
                'px-4 py-1 rounded-full text-sm font-medium border transition-colors duration-200 bg-gray-800 text-white border-gray-800',
                { exact: true }
            )
        })
    })
})
