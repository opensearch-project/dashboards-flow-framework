/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GeneratedQuery } from './generated_query';

// Mock the customStringify function to ensure consistent output
jest.mock('../../../../../common', () => ({
  customStringify: jest.fn((obj) => JSON.stringify(obj, null, 2)),
}));

describe('GeneratedQuery', () => {
  const mockQuery = {
    query: {
      bool: {
        must: [
          {
            match: {
              content: 'test query',
            },
          },
        ],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all expected components', () => {
    render(<GeneratedQuery query={mockQuery} />);
    expect(screen.getByTestId('generatedQueryTitle')).toBeInTheDocument();
    expect(screen.getByTestId('hideShowQueryButton')).toBeInTheDocument();
    expect(screen.getByTestId('generatedQueryCodeBlock')).toBeInTheDocument();
  });

  test('renders the query in a code block', () => {
    render(<GeneratedQuery query={mockQuery} />);
    // Check that a code block is rendered
    const codeBlock = screen.getByTestId('generatedQueryCodeBlock');
    expect(codeBlock).toBeInTheDocument();
  });

  test('toggle visibility button works', () => {
    render(<GeneratedQuery query={mockQuery} />);

    // Code block should be visible initially
    expect(screen.getByTestId('generatedQueryCodeBlock')).toBeInTheDocument();

    // Click the hide button
    const toggleButton = screen.getByTestId('hideShowQueryButton');
    fireEvent.click(toggleButton);

    // Code block should now be hidden
    expect(
      screen.queryByTestId('generatedQueryCodeBlock')
    ).not.toBeInTheDocument();

    // Click the show button
    fireEvent.click(toggleButton);

    // Code block should be visible again
    expect(screen.getByTestId('generatedQueryCodeBlock')).toBeInTheDocument();
  });

  test('code block is not shown when showQuery is false', () => {
    render(<GeneratedQuery query={mockQuery} />);

    // Click the hide button
    const toggleButton = screen.getByTestId('hideShowQueryButton');
    fireEvent.click(toggleButton);

    // Code block should not be in the document
    expect(
      screen.queryByTestId('generatedQueryCodeBlock')
    ).not.toBeInTheDocument();
  });
});
