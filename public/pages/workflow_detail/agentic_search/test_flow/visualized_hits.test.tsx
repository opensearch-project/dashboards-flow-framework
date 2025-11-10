/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VisualizedHits } from './visualized_hits';

const mockHits = [
  {
    _id: '1',
    _source: {
      title: 'Test Image 1',
      description: 'A test image',
      image_url: 'https://example.com/image1.jpg',
      category: 'test',
    },
  },
  {
    _id: '2',
    _source: {
      title: 'Test Image 2',
      description: 'Another test image',
      image_url: 'https://example.com/image2.png',
      category: 'test',
      extra_field: 'extra data',
    },
  },
];

describe('VisualizedHits', () => {
  it('renders hits with images', () => {
    render(<VisualizedHits hits={mockHits} imageFieldName="image_url" />);

    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByText('Test Image 2')).toBeInTheDocument();
    expect(screen.getAllByAltText('Hit image')).toHaveLength(2);
  });

  it('renders without images when imageFieldName is not provided', () => {
    render(<VisualizedHits hits={mockHits} imageFieldName="" />);

    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.queryByAltText('Hit image')).not.toBeInTheDocument();
  });

  it('shows "View more" button when hit has more than 3 fields', () => {
    render(<VisualizedHits hits={mockHits} imageFieldName="image_url" />);

    expect(screen.getByText('View more')).toBeInTheDocument();
  });

  it('opens flyout when "View more" is clicked', () => {
    render(<VisualizedHits hits={mockHits} imageFieldName="image_url" />);

    fireEvent.click(screen.getByText('View more'));

    expect(screen.getByText('Search result details')).toBeInTheDocument();
  });
});
