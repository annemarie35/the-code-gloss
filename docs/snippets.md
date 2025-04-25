Mock a function called in a component with
`const gloses = await getGlosesDbQuery()`

Mock vith vitest :

```javascript
import * as mod from '@/lib/get-gloses'

    const mockedGetGloses = vi.spyOn(mod, 'getGloses')
    vi.mock('@/lib/get-gloses', async (importOriginal) => {
        return {
            ...(await importOriginal<typeof import('@/lib/get-gloses')>()),
            getGlosesDbQuery: vi.fn().mockResolvedValue([])
        }
    })
```

```javascript
import * as GlosesActions from '@/src/actions/actions'
addGloseTermSpy = vi.spyOn(GlosesActions, 'addGlossTerm')
```

[source](https://dev.to/erikpuk/how-to-mock-a-third-party-es6-export-in-vitest-38ff)

## Mock action

The problem with that was that I couldn't unmock for testing mocked api call

```javascript
// This below don't works
vi.clearAllMocks()
vi.doUnmock('@/src/actions/glosesActions')
vi.resetModules()
vi.mock('@/src/actions/glosesActions', async (importOriginal) => {
    return {
        ...(await importOriginal<typeof import('@/src/actions/glosesActions')>()),
        addGlossTerm: vi.fn().mockResolvedValue({ message: 'Nouveau terme ajouté avec succès', error: null })
    }
})
```

## Mock Postgres

```javascript
vi.mock('pg', () => {
    const Client = vi.fn()
    Client.prototype.connect = vi.fn()
    Client.prototype.query = vi.fn()
    Client.prototype.end = vi.fn()

    return { Client }
})
```

[source](https://vitest.dev/guide/mocking.html)

## Mock Knex

```js
vi.mock('knex', () => ({
    default: vi.fn().mockReturnValue(() => {
        return {
            select: () => [
                {
                    id: 1,
                    title: 'TDD',
                    description: 'Created by Kent Beck',
                    tags: 'XP',
                    created_at: '2000-02-01T12:00:00.000Z'
                }
            ]
        }
    })
}))
```

## Mock Fs path with Typescript

TypeScript ne reconnaît pas la méthode mockReturnValue sur path.resolve car il ne sait pas que path a été transformé en mock.

```typescript
import { MockedObject } from 'vitest'

import fs from 'fs'
vi.mock('fs')

mockedFs.existsSync.mockReturnValue(true)
mockedFs.readFileSync.mockReturnValue(JSON.stringify(testData))
```

Alternative : typer seulement la fonction resolve

```typescript
import path from 'path'
import { vi, MockedFunction } from 'vitest'

vi.mock('path')

const mockedResolve = path.resolve as MockedFunction<typeof path.resolve>

mockedResolve.mockReturnValue('/fake/path/data.json')
```
