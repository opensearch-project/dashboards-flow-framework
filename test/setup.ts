/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
});

// Mock matchMedia for Monaco Editor and EUI components
// This mock prevents infinite re-renders in React 18 by not triggering change handlers
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  }),
});

jest.mock('@elastic/eui/lib/services/hooks/useIsWithinBreakpoints', () => ({
  useIsWithinBreakpoints: jest.fn(() => true),
}));
