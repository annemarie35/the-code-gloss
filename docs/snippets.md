Mock a function called in a component with
`const gloses = await getGloses()`

Mock vith vitest :

```javascript
import * as mod from '@/lib/get-gloses'

    const mockedGetGloses = vi.spyOn(mod, 'getGloses')
    vi.mock('@/lib/get-gloses', async (importOriginal) => {
        return {
            ...(await importOriginal<typeof import('@/lib/get-gloses')>()),
            getGloses: vi.fn().mockResolvedValue([])
        }
    })

```

```javascript
import * as GlosesActions from '@/src/actions/actions'
addGloseTermSpy = vi.spyOn(GlosesActions, 'addGlossTerm')
```

[source](https://dev.to/erikpuk/how-to-mock-a-third-party-es6-export-in-vitest-38ff)
