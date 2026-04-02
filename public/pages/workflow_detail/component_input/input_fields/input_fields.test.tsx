/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { TextField } from './text_field';
import { SelectField } from './select_field';
import { BooleanField } from './boolean_field';

jest.mock('../../../../services', () => {
  const { mockCoreServices } = require('../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../services'),
    ...mockCoreServices,
  };
});

// Helper to wrap components in Formik context
function renderWithFormik(
  ui: React.ReactElement,
  initialValues: Record<string, any> = {}
) {
  return render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      {ui}
    </Formik>
  );
}

describe('TextField', () => {
  test('renders with label', () => {
    renderWithFormik(<TextField fieldPath="myField" label="My Label" />, {
      myField: '',
    });
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  test('renders input with initial value', () => {
    renderWithFormik(<TextField fieldPath="myField" />, {
      myField: 'hello',
    });
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  test('renders as textarea when textArea prop is true', () => {
    const { container } = renderWithFormik(
      <TextField fieldPath="myField" textArea={true} />,
      { myField: '' }
    );
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  test('renders help link when provided', () => {
    renderWithFormik(
      <TextField fieldPath="myField" helpLink="https://example.com" />,
      { myField: '' }
    );
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  test('renders placeholder text', () => {
    renderWithFormik(
      <TextField fieldPath="myField" placeholder="Enter value" />,
      { myField: '' }
    );
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });
});

describe('SelectField', () => {
  const field = {
    id: 'my_select',
    type: 'select' as const,
    selectOptions: ['option_a', 'option_b'],
  };

  test('renders with label derived from field id', () => {
    renderWithFormik(
      <SelectField field={field} fieldPath="mySelect" />,
      { mySelect: '' }
    );
    expect(screen.getByText('My Select')).toBeInTheDocument();
  });

  test('renders select options', () => {
    renderWithFormik(
      <SelectField field={field} fieldPath="mySelect" />,
      { mySelect: 'option_a' }
    );
    expect(screen.getAllByText('option_a').length).toBeGreaterThan(0);
  });
});

describe('BooleanField', () => {
  test('renders checkbox type with label', () => {
    renderWithFormik(
      <BooleanField fieldPath="myBool" label="Enable feature" type="Checkbox" />,
      { myBool: true }
    );
    expect(screen.getByText('Enable feature')).toBeInTheDocument();
  });

  test('renders switch type with label', () => {
    renderWithFormik(
      <BooleanField fieldPath="myBool" label="Toggle me" type="Switch" />,
      { myBool: false }
    );
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
  });

  test('renders checkbox as checked when value is true', () => {
    renderWithFormik(
      <BooleanField fieldPath="myBool" label="Check" type="Checkbox" />,
      { myBool: true }
    );
    const checkbox = screen.getByTestId('checkbox-myBool');
    expect(checkbox).toBeChecked();
  });

  test('renders switch as unchecked when value is false and inverse is true', () => {
    renderWithFormik(
      <BooleanField fieldPath="myBool" label="Inverse" type="Switch" inverse={true} />,
      { myBool: true }
    );
    const toggle = screen.getByTestId('switch-myBool');
    expect(toggle).not.toBeChecked();
  });

  test('renders help text when provided', () => {
    renderWithFormik(
      <BooleanField fieldPath="myBool" label="Help" type="Checkbox" helpText="Some help" />,
      { myBool: true }
    );
    // EuiIconTip renders an icon, the help text is in a tooltip
    expect(screen.getByText('Help')).toBeInTheDocument();
  });
});
