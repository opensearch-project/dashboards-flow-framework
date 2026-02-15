/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResults } from './search_results';

describe('SearchResults', () => {
  // Mock search response with different data scenarios
  const mockSearchResponseWithHits = {
    took: 5,
    hits: {
      total: { value: 10 },
      hits: [
        { _id: '1', _source: { title: 'Document 1' } },
        { _id: '2', _source: { title: 'Document 2' } },
      ],
    },
  };

  const mockSearchResponseWithAggregations = {
    took: 3,
    hits: {
      total: { value: 0 },
      hits: [],
    },
    aggregations: {
      avg_price: { value: 100 },
    },
  };

  const mockSearchResponseWithImages = {
    took: 4,
    hits: {
      total: { value: 2 },
      hits: [
        { _id: '1', _source: { title: 'Image 1', image_url: 'photo1.jpg' } },
        { _id: '2', _source: { title: 'Image 2', thumbnail: 'image2.png' } },
      ],
    },
  };

  const mockSearchResponseNoImages = {
    took: 2,
    hits: {
      total: { value: 2 },
      hits: [
        { _id: '1', _source: { title: 'Document 1', content: 'text content' } },
        { _id: '2', _source: { title: 'Document 2', description: 'more text' } },
      ],
    },
  };

  const mockEmptySearchResponse = {
    took: 1,
    hits: {
      total: { value: 0 },
      hits: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all expected components', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithHits} />);

    expect(screen.getByTestId('searchResultsTitle')).toBeInTheDocument();
    expect(screen.getByTestId('hideShowResultsButton')).toBeInTheDocument();
    expect(screen.getByTestId('resultsViewButtonGroup')).toBeInTheDocument();
    expect(screen.getByTestId('resultsTableContainer')).toBeInTheDocument();
  });

  test('toggle visibility button works', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithHits} />);

    // Results should be visible initially
    expect(screen.getByTestId('resultsViewButtonGroup')).toBeInTheDocument();

    // Click the hide button
    const toggleButton = screen.getByTestId('hideShowResultsButton');
    fireEvent.click(toggleButton);

    // Results should now be hidden
    expect(
      screen.queryByTestId('resultsViewButtonGroup')
    ).not.toBeInTheDocument();

    // Click the show button
    fireEvent.click(toggleButton);

    // Results should be visible again
    expect(screen.getByTestId('resultsViewButtonGroup')).toBeInTheDocument();
  });

  test('switching between views works', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithHits} />);

    // Should default to hits view
    expect(screen.getByTestId('resultsTableContainer')).toBeInTheDocument();

    // Click the Raw Response button
    const rawResponseButton = screen.getByTestId('rawResponseButton');
    fireEvent.click(rawResponseButton);

    // Should show the raw response
    expect(screen.getByTestId('rawResponseCodeBlock')).toBeInTheDocument();

    // Back to hits view
    const hitsButton = screen.getByTestId('hitsButton');
    fireEvent.click(hitsButton);

    // Should show the hits table again
    expect(screen.getByTestId('resultsTableContainer')).toBeInTheDocument();
  });

  test('shows appropriate content based on response data - with hits', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithHits} />);

    // Should show hits table
    expect(screen.getByTestId('resultsTableContainer')).toBeInTheDocument();
    expect(screen.getByText('10 documents')).toBeInTheDocument();
    expect(screen.getByText('· 5ms')).toBeInTheDocument();
  });

  test('shows appropriate content based on response data - with aggregations', () => {
    render(
      <SearchResults searchResponse={mockSearchResponseWithAggregations} />
    );

    // Should auto-select aggregations tab when there are no hits but there are aggregations
    // Click the Aggregations button first since the default is hits view
    const aggregationsButton = screen.getByTestId('aggregationsButton');
    fireEvent.click(aggregationsButton);

    expect(screen.getByTestId('aggregationsCodeBlock')).toBeInTheDocument();
    expect(screen.getByText('0 documents')).toBeInTheDocument();
    expect(screen.getByText('· 3ms')).toBeInTheDocument();
  });

  test('shows appropriate content based on response data - empty response', () => {
    render(<SearchResults searchResponse={mockEmptySearchResponse} />);

    // By default the raw JSON response is shown when there are no hits and no aggregations
    expect(screen.getByTestId('rawResponseCodeBlock')).toBeInTheDocument();
  });

  test('visual button is not present when no image fields found', () => {
    render(<SearchResults searchResponse={mockSearchResponseNoImages} />);

    // Visual button should not be present
    expect(screen.queryByTestId('visualButton')).not.toBeInTheDocument();
    // Hits button should be present
    expect(screen.getByTestId('hitsButton')).toBeInTheDocument();
  });

  test('aggregations button is present when aggs field found', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithAggregations} />);

    // Aggregations button should be present
    expect(screen.getByTestId('aggregationsButton')).toBeInTheDocument();
  });

  test('visual button is present when image field found', () => {
    render(<SearchResults searchResponse={mockSearchResponseWithImages} />);

    // Visual button should be present
    expect(screen.getByTestId('visualButton')).toBeInTheDocument();
    // Hits button should also be present
    expect(screen.getByTestId('hitsButton')).toBeInTheDocument();
  });
});
