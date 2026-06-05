import { render, screen } from '@testing-library/react'
import { SplineScene } from './spline'
import { describe, it, expect, vi } from 'vitest'

// Mock the React lazy import to throw an error immediately 
// to simulate the "Failed to fetch" network error.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    lazy: (factory: any) => {
      // Create a component that explicitly throws an error when rendered
      const FailingComponent = () => {
        throw new TypeError('Failed to fetch')
      }
      return FailingComponent
    }
  }
})

describe('SplineScene ErrorBoundary', () => {
  // Prevent React from logging the intentional error to the console during the test
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('silently catches the Failed to fetch error and renders nothing instead of crashing', () => {
    const { container } = render(
      <SplineScene scene="https://prod.spline.design/example/scene.splinecode" />
    )
    
    // The ErrorBoundary should catch the error and return null, 
    // meaning the container should be empty.
    expect(container).toBeEmptyDOMElement()
  })
})
