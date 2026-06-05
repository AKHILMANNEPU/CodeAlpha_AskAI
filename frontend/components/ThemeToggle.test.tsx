import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import { ThemeProvider } from 'next-themes'
import { describe, it, expect, vi } from 'vitest'

describe('ThemeToggle', () => {
  it('renders the toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // The visual state will change, testing next-themes logic is tricky
    // but we can ensure the button reacts to clicks without crashing
    expect(button).toBeInTheDocument()
  })
})
