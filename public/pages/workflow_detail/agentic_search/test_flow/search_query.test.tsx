/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QUERY_PLACEHOLDER_CONTENT, SearchQuery } from './search_query';
import { FormikContext } from 'formik';
import { AGENT_TYPE } from '../../../../../common';

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
    agentType: AGENT_TYPE.CONVERSATIONAL,
    memoryId: '',
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

  test('shows appropriate buttons when memory_id exists', () => {
    renderComponent(
      {
        values: {
          search: {
            request: QUERY_WITH_MEMORY_ID,
          },
        },
      },
      {
        ...defaultProps,
        memoryId: 'test-memory-id',
      }
    );

    const clearButton = screen.getByText('Clear conversation');
    const continueButton = screen.queryByText('Continue conversation');
    expect(clearButton).toBeInTheDocument();
    expect(continueButton).not.toBeInTheDocument();
  });

  test('shows appropriate buttons when memory_id does not exist and is not available', () => {
    renderComponent({
      values: {
        search: {
          request: QUERY_NO_MEMORY_ID,
        },
      },
    });

    const continueButton = screen.queryByText('Continue conversation');
    const clearButton = screen.queryByText('Clear conversation');
    expect(continueButton).not.toBeInTheDocument();
    expect(clearButton).not.toBeInTheDocument();
  });

  test('shows appropriate buttons when memory_id does not exist, but memory is available', () => {
    renderComponent(
      {
        values: {
          search: {
            request: QUERY_NO_MEMORY_ID,
          },
        },
      },
      {
        ...defaultProps,
        memoryId: 'test-memory-id',
      }
    );

    const continueButton = screen.getByText('Continue conversation');
    const clearButton = screen.queryByText('Clear conversation');
    expect(continueButton).toBeInTheDocument();
    expect(clearButton).not.toBeInTheDocument();
  });

  test('clicking clear conversation button removes memory_id', () => {
    const setFieldValueMock = jest.fn();
    renderComponent(
      {
        values: {
          search: {
            request: QUERY_WITH_MEMORY_ID,
          },
        },
        setFieldValue: setFieldValueMock,
      },
      {
        ...defaultProps,
        memoryId: 'test-memory-id',
      }
    );
    // Click the clear conversation button
    const clearButton = screen.getByText('Clear conversation');
    fireEvent.click(clearButton);

    // Check that setFieldValue was called with the updated query (without memory_id)
    expect(setFieldValueMock).toHaveBeenCalled();
    expect(setFieldValueMock.mock.calls[0][0]).toBe('search.request');
  });

  test('clicking continue conversation button adds memory_id', () => {
    const setFieldValueMock = jest.fn();
    renderComponent(
      {
        values: {
          search: {
            request: QUERY_NO_MEMORY_ID,
          },
        },
        setFieldValue: setFieldValueMock,
      },
      {
        ...defaultProps,
        memoryId: 'test-memory-id',
      }
    );
    // Click the clear conversation button
    const clearButton = screen.getByText('Continue conversation');
    fireEvent.click(clearButton);

    // Check that setFieldValue was called with the updated query (with memory_id)
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
