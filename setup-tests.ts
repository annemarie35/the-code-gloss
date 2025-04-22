import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

console.log('Running setup tests...')

import '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
    cleanup()
})
