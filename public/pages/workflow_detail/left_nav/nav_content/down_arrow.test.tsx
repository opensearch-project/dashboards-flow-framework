/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DownArrow } from './down_arrow';

describe('DownArrow', () => {
  test('renders the icon', () => {
    const { container } = render(<DownArrow />);
    expect(container.querySelector('.euiIcon')).toBeInTheDocument();
  });
});
