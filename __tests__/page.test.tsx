import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from "react";
import Page from '@/app/page';

test('Page', () => {
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined()
})