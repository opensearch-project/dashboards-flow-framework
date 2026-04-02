/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Errors } from './errors';

describe('Errors', () => {
  test('renders empty state when no errors', () => {
    render(<Errors errorMessages={[]} />);
    expect(screen.getByText('No errors')).toBeInTheDocument();
  });

  test('renders error messages', () => {
    render(<Errors errorMessages={['Something went wrong', 'Another error']} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Another error')).toBeInTheDocument();
  });
});
