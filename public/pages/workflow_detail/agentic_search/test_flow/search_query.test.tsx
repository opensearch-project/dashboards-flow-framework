/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QUERY_PLACEHOLDER_CONTENT, SearchQuery } from './search_query';
import { FormikContext } from 'formik';

const QUERY_NO_MEMORY_ID = JSON.stringify({
  query: {
    agentic: {
      query_text: '',
    },
  },
});

const QUERY_WITH_MEMORY_ID = JSON.stringify({
  query: {
    agentic: {
      query_text: 'test query',
      memory_id: 'test-memory-id',
    },
  },
});

describe('SearchQuery', () => {
  const defaultProps = {
    setSearchPipeline: jest.fn(),
    fieldMappings: undefined,
    handleSearch: jest.fn(),
    isSearching: false,
  };

  const renderComponent = (mockContext: any, props = defaultProps) => {
    return render(
      <FormikContext.Provider value={mockContext}>
        <SearchQuery {...props} />
      </FormikContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search query component', () => {
    renderComponent({
      values: {
        search: {
          request: QUERY_NO_MEMORY_ID,
        },
      },
    });
    expect(screen.getByText('Query')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(QUERY_PLACEHOLDER_CONTENT)
    ).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('shows clear conversation button when memory_id exists', () => {
    renderComponent({
      values: {
        search: {
          request: QUERY_WITH_MEMORY_ID,
        },
      },
    });

    // Check that the clear conversation button is present
    const clearButton = screen.getByText('Clear conversation');
    expect(clearButton).toBeInTheDocument();
  });

  test('does not show clear conversation button when memory_id does not exist', () => {
    renderComponent({
      values: {
        search: {
          request: QUERY_NO_MEMORY_ID,
        },
      },
    });

    // Check that the clear conversation button is not present
    const clearButton = screen.queryByText('Clear conversation');
    expect(clearButton).not.toBeInTheDocument();
  });

  test('clicking clear conversation button removes memory_id', () => {
    const setFieldValueMock = jest.fn();
    renderComponent({
      values: {
        search: {
          request: QUERY_WITH_MEMORY_ID,
        },
      },
      setFieldValue: setFieldValueMock,
    });
    // Click the clear conversation button
    const clearButton = screen.getByText('Clear conversation');
    fireEvent.click(clearButton);

    // Check that setFieldValue was called with the updated query (without memory_id)
    expect(setFieldValueMock).toHaveBeenCalled();
    expect(setFieldValueMock.mock.calls[0][0]).toBe('search.request');
  });

  test('switches between simple and advanced mode', () => {
    renderComponent({
      values: {
        search: {
          request: QUERY_NO_MEMORY_ID,
        },
      },
    });

    // Default is simple mode
    expect(
      screen.getByPlaceholderText(QUERY_PLACEHOLDER_CONTENT)
    ).toBeInTheDocument();

    // Switch to advanced mode
    const advancedButton = screen.getByText('JSON');
    fireEvent.click(advancedButton);

    // Should now show JSON editor
    expect(
      screen.queryByPlaceholderText(QUERY_PLACEHOLDER_CONTENT)
    ).not.toBeInTheDocument();
  });
});
