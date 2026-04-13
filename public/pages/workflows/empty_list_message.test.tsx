/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyListMessage } from './empty_list_message';

describe('EmptyListMessage', () => {
  test('renders no workflows message', () => {
    render(<EmptyListMessage onClickNewWorkflow={jest.fn()} />);
    expect(screen.getByText('No workflows found')).toBeInTheDocument();
  });

  test('renders new workflow button', () => {
    const mockClick = jest.fn();
    render(<EmptyListMessage onClickNewWorkflow={mockClick} />);
    expect(screen.getByText('New workflow')).toBeInTheDocument();
  });
});
