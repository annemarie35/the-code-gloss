import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import unusedImports from 'eslint-plugin-unused-imports'

const isReactRule = (key) => key.startsWith('react/') || key.startsWith('react-hooks/')

const eslintConfig = [
    ...coreWebVitals.map((config) => {
        if (config.plugins?.react) {
            const otherPlugins = Object.fromEntries(
                Object.entries(config.plugins).filter(([k]) => !isReactRule(k) && k !== 'react')
            )
            const otherRules = Object.fromEntries(Object.entries(config.rules || {}).filter(([k]) => !isReactRule(k)))
            return { ...config, plugins: otherPlugins, rules: otherRules }
        }
        return config
    }),
    ...nextTypescript,
    {
        plugins: { 'unused-imports': unusedImports },
        rules: {
            'unused-imports/no-unused-imports': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
        }
    },
    { ignores: ['**/node_modules/', '**/.next/'] }
]

export default eslintConfig
