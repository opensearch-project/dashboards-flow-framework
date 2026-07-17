/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
});

// jest-location-mock uses process.env.HOST as the base URL for its window.location mock.
// Set it to match testEnvironmentOptions.url so window.location.origin is 'http://localhost:5601'.
process.env.HOST = 'http://localhost:5601';

// Mock matchMedia for Monaco Editor and EUI components
// This mock prevents infinite re-renders in React 18 by not triggering change handlers
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
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

// Globally mock @osd/monaco. monaco-editor ships untranspiled ESM that breaks the CJS
// Jest runtime (and jsdom); core/public imports @osd/monaco transitively via core_system.
// Mirrors src/dev/jest/setup/monaco_mock.js in the parent repo.
jest.mock('@osd/monaco', () => {
  const monaco = {
    editor: {
      defineTheme: jest.fn(),
      IStandaloneCodeEditor: jest.fn(),
      ITextModel: jest.fn(),
    },
    languages: {
      CompletionItemKind: {},
      CompletionItemProvider: jest.fn(),
      SignatureHelpProvider: jest.fn(),
      HoverProvider: jest.fn(),
      LanguageConfiguration: jest.fn(),
      onLanguage: jest.fn(),
      register: jest.fn(),
      registerCompletionItemProvider: jest.fn(),
      registerSignatureHelpProvider: jest.fn(),
      registerHoverProvider: jest.fn(),
      setLanguageConfiguration: jest.fn(),
      setMonarchTokensProvider: jest.fn(),
    },
    KeyCode: { Enter: 13 },
    KeyMod: { CtrlCmd: 2048 },
    Position: class {
      lineNumber: number;
      column: number;
      constructor(lineNumber: number, column: number) {
        this.lineNumber = lineNumber;
        this.column = column;
      }
    },
    Range: jest.fn(),
    CancellationToken: jest.fn(),
    IMonarchLanguage: jest.fn(),
  };

  class MockWorker {
    url: string;
    postMessage = jest.fn();
    terminate = jest.fn();
    onmessage = null;
    onerror = null;
    constructor(url: string) {
      this.url = url;
    }
  }

  const getWorker = jest.fn(() => new MockWorker('mock-worker-url'));

  return { monaco, getWorker, setBuildHash: jest.fn() };
});

// jsdom 26 marks window.localStorage and window.sessionStorage as non-configurable.
// Re-declare them as configurable once here so individual tests can override them
// with Object.defineProperty without hitting "Cannot redefine property" errors.
['localStorage', 'sessionStorage'].forEach((key) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, key, {
      configurable: true,
      writable: true,
      value: descriptor.value,
    });
  }
});
