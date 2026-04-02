/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProcessingBadge } from './processing_badge';
import { ProcessorsTitle } from './processors_title';
import { MultiSelectFilter } from './multi_select_filter';
import { PROCESSOR_CONTEXT } from '../../common';

describe('ProcessingBadge', () => {
  test('renders one-to-one for ingest context', () => {
    render(<ProcessingBadge context={PROCESSOR_CONTEXT.INGEST} oneToOne={false} />);
    expect(screen.getByText('One to one processing')).toBeInTheDocument();
  });

  test('renders one-to-one for search response when oneToOne is true', () => {
    render(<ProcessingBadge context={PROCESSOR_CONTEXT.SEARCH_RESPONSE} oneToOne={true} />);
    expect(screen.getByText('One to one processing')).toBeInTheDocument();
  });

  test('renders many-to-one for search response when oneToOne is false', () => {
    render(<ProcessingBadge context={PROCESSOR_CONTEXT.SEARCH_RESPONSE} oneToOne={false} />);
    expect(screen.getByText('Many to one processing')).toBeInTheDocument();
  });

  test('renders nothing for search request context', () => {
    const { container } = render(
      <ProcessingBadge context={PROCESSOR_CONTEXT.SEARCH_REQUEST} oneToOne={true} />
    );
    expect(container.querySelector('.euiBadge')).toBeNull();
  });
});

describe('ProcessorsTitle', () => {
  test('renders title with count', () => {
    render(<ProcessorsTitle title="Ingest" processorCount={3} optional={false} />);
    expect(screen.getByText('Ingest (3)')).toBeInTheDocument();
  });

  test('renders optional label when optional is true', () => {
    render(<ProcessorsTitle title="Search" processorCount={0} optional={true} />);
    expect(screen.getByText('- optional')).toBeInTheDocument();
  });

  test('does not render optional label when optional is false', () => {
    render(<ProcessorsTitle title="Search" processorCount={1} optional={false} />);
    expect(screen.queryByText('- optional')).toBeNull();
  });
});

describe('MultiSelectFilter', () => {
  const mockFilters = [
    { name: 'Filter A', checked: undefined },
    { name: 'Filter B', checked: undefined },
  ] as any[];

  test('renders filter button with title', () => {
    render(
      <MultiSelectFilter title="Status" filters={mockFilters} setSelectedFilters={jest.fn()} />
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('opens popover and shows filter items on click', () => {
    render(
      <MultiSelectFilter title="Status" filters={mockFilters} setSelectedFilters={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Status'));
    expect(screen.getByText('Filter A')).toBeInTheDocument();
    expect(screen.getByText('Filter B')).toBeInTheDocument();
  });

  test('calls setSelectedFilters when a filter is toggled', () => {
    const mockSetFilters = jest.fn();
    render(
      <MultiSelectFilter title="Status" filters={mockFilters} setSelectedFilters={mockSetFilters} />
    );
    fireEvent.click(screen.getByText('Status'));
    fireEvent.click(screen.getByText('Filter A'));
    expect(mockSetFilters).toHaveBeenCalled();
  });
});
