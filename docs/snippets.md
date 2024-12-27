Mock a function called in a component with
`const gloses = await getGloses()`

Mock vith vitest :

```javascript
    const mockedGetGloses = vi.spyOn(mod, 'getGloses')
    vi.mock('@/lib/get-gloses', async (importOriginal) => {
        return {
            ...(await importOriginal<typeof import('@/lib/get-gloses')>()),
            getGloses: vi.fn().mockResolvedValue([])
        }
    })

```
