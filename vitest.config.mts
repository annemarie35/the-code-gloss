import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true
    },
    test: {
        exclude: [
            '**/integration-tests/**',
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
            '__tests__/infra/**/!(create_gloses_and_seeds).test.ts',
            '__tests__/src/infrastructure/postgres/**',
            '.agents/**',
            '.claude/**'
        ],
        environment: 'jsdom',
        setupFiles: ['setup-tests.ts']
    }
})
