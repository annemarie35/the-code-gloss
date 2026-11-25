import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        tsconfigPaths: true
    },
    test: {
        include: ['__tests__/infra/**/*.test.ts', '__tests__/src/infrastructure/postgres/**/*.test.ts'],
        environment: 'node'
    }
})
