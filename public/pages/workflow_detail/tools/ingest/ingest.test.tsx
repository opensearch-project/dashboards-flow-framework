/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Ingest } from './ingest';

// Mock EuiCodeEditor since it depends on Ace editor
jest.mock('@elastic/eui', () => {
  const original = jest.requireActual('@elastic/eui');
  return {
    ...original,
    EuiCodeEditor: ({ value }: { value: string }) => (
      <pre data-testid="code-editor">{value}</pre>
    ),
  };
});

describe('Ingest', () => {
  test('renders empty state when no response', () => {
    render(<Ingest ingestResponse="" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  test('renders response when provided', () => {
    render(<Ingest ingestResponse='{"result": "ok"}' />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });
});
