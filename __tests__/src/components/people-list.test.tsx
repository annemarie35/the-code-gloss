import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PeopleList from '@/src/components/people-list'
import { Person } from '@/src/core/domain/Types/Person'

const people: Person[] = [
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

describe('People List', () => {
    describe('Displays a people list', () => {
        beforeEach(() => {
            render(<PeopleList loading={false} peopleList={[]} error={''} />)
        })

        it('does not display a loading message by default', () => {
            expect(screen.queryByText(/Chargement des données en cours/i)).not.toBeInTheDocument()
        })
    })

    describe('When people are not loaded yet', () => {
        beforeEach(() => {
            render(<PeopleList loading={true} peopleList={[]} error={''} />)
        })

        it('displays a loading message', () => {
            expect(screen.queryByText(/Chargement des données en cours/i)).toBeInTheDocument()
        })
    })

    describe('When there is a problem while fetching people', () => {
        beforeEach(() => {
            render(<PeopleList loading={false} peopleList={[]} error={'Une erreur est survenue.'} />)
        })

        it('should display an error message', () => {
            expect(screen.getByText(/Une erreur est survenue./i)).toBeInTheDocument()
        })
    })

    describe('When people are loaded', () => {
        beforeEach(() => {
            render(<PeopleList loading={false} peopleList={people} error={''} />)
        })

        it('should display the person full name via PeopleGrid', () => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
        })

        it('should display the person biography', () => {
            expect(screen.getByText('First programmer')).toBeInTheDocument()
        })
    })
})
