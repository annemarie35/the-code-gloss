// Accepted risk: braces stack-exhaustion DoS (GHSA-vfj7-8cjw-p6xm).
// Reached only via eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch.
// Dev-only lint tooling, never fed user input, no patched braces release.
// Revisit when @next/eslint-plugin-next updates fast-glob.
const ACCEPTED_RISK_RULE_IDS = new Set(
    ['braces', 'micromatch', 'fast-glob', 'next-eslint-plugin-next', 'eslint-config-next'].map(
        (name) => `vice/dependencies/npm-advisory/${name}`
    )
)

const ACCEPTED_RISK_REASON = 'Accepted risk: dev-only lint tooling, no patched release.'

export const transformFinding = (finding) => {
    if (!ACCEPTED_RISK_RULE_IDS.has(finding.rule_id)) return finding
    return {
        ...finding,
        severity: 'INFO',
        detail: [finding.detail, ACCEPTED_RISK_REASON].filter(Boolean).join('\n')
    }
}

const viceConfig = { transformFinding }

export default viceConfig
