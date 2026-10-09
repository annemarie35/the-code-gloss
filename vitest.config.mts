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
            '__tests__/infra/**',
            '.agents/**',
            '.claude/**'
        ],
        environment: 'jsdom',
        setupFiles: ['setup-tests.ts']
    }
})
