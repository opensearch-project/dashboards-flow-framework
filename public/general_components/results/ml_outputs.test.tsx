/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MLOutputs } from './ml_outputs';

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

describe('MLOutputs', () => {
  test('renders empty state when no outputs', () => {
    render(<MLOutputs mlOutputs={{}} />);
    expect(screen.getByText('No outputs found')).toBeInTheDocument();
  });

  test('renders outputs when provided', () => {
    render(<MLOutputs mlOutputs={{ inference: 'result' }} />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  test('renders documentation link', () => {
    render(<MLOutputs mlOutputs={{}} />);
    expect(screen.getByText('See an example')).toBeInTheDocument();
  });
});
