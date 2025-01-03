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
