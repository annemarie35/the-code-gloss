import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

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
    { ignores: ['**/node_modules/', '**/.next/'] }
]

export default eslintConfig
