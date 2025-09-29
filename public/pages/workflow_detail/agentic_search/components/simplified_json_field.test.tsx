/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimplifiedJsonField } from './simplified_json_field';
import { customStringify } from '../../../../../common';

// Mock the EuiCodeEditor component since it depends on Ace editor which doesn't play well in Jest tests
jest.mock('@elastic/eui', () => {
  const original = jest.requireActual('@elastic/eui');
  return {
    ...original,
    EuiCodeEditor: ({
      value,
      onChange,
      onBlur,
      ...rest
    }: {
      value: string;
      onChange: (value: string) => void;
      onBlur: () => void;
      [key: string]: any
    }) => (
      <textarea
        data-testid="mockCodeEditor"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onBlur={onBlur}
        {...Object.fromEntries(
          Object.entries(rest).map(([key, value]) => {
            if (key === 'tabSize') return ['tabsize', value];
            if (key === 'setOptions') return ['setoptions', value];
            return [key, value];
          })
        )}
      />
    ),
  };
});

describe('SimplifiedJsonField', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();
  const mockValue = JSON.stringify({ test: 'value' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<SimplifiedJsonField value={mockValue} onBlur={mockOnBlur} />);

    const editor = screen.getByTestId('mockCodeEditor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue(mockValue);
  });

  test('renders with custom props', () => {
    render(
      <SimplifiedJsonField
        label="Test Label"
        value={mockValue}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
        helpText="Help text"
        editorHeight="300px"
        isInvalid={true}
        error="Error message"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Help text')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('renders with help link', () => {
    render(
      <SimplifiedJsonField
        value={mockValue}
        onBlur={mockOnBlur}
        helpLink="https://example.com"
      />
    );

    const link = screen.getByText('Learn more');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  test('calls onChange when input changes', () => {
    render(
      <SimplifiedJsonField
        value={mockValue}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const newValue = '{"updated": true}';
    const editor = screen.getByTestId('mockCodeEditor');

    fireEvent.change(editor, { target: { value: newValue } });

    expect(mockOnChange).toHaveBeenCalledWith(newValue);
  });

  test('formats JSON and calls onBlur when editor loses focus', () => {
    const inputJson = '{"test": "value", "nested": {"key": "value"}}';
    const formattedJson = customStringify(JSON.parse(inputJson));

    render(
      <SimplifiedJsonField
        value={inputJson}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const editor = screen.getByTestId('mockCodeEditor');
    fireEvent.blur(editor);

    expect(mockOnBlur).toHaveBeenCalledWith(formattedJson);
  });

  test('handles invalid JSON on blur', () => {
    const invalidJson = '{"test": "value",}'; // Invalid JSON with trailing comma

    render(
      <SimplifiedJsonField
        value={invalidJson}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const editor = screen.getByTestId('mockCodeEditor');
    fireEvent.blur(editor);

    // onBlur should not be called with formatted JSON if input is invalid
    expect(mockOnBlur).not.toHaveBeenCalled();
  });

  test('updates when value prop changes', () => {
    const { rerender } = render(
      <SimplifiedJsonField
        value={mockValue}
        onBlur={mockOnBlur}
      />
    );

    const editor = screen.getByTestId('mockCodeEditor');
    expect(editor).toHaveValue(mockValue);

    const newValue = '{"updated": true}';
    rerender(
      <SimplifiedJsonField
        value={newValue}
        onBlur={mockOnBlur}
      />
    );

    expect(editor).toHaveValue(newValue);
  });
});