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
import { NumberField } from './number_field';
import { SelectWithCustomOptions } from './select_with_custom_options';

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

describe('NumberField', () => {
  test('renders with label', () => {
    renderWithFormik(<NumberField fieldPath="myNum" label="Count" />, {
      myNum: 0,
    });
    expect(screen.getByText('Count')).toBeInTheDocument();
  });

  test('renders with initial value', () => {
    renderWithFormik(<NumberField fieldPath="myNum" />, {
      myNum: 42,
    });
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });

  test('renders help link when provided', () => {
    renderWithFormik(
      <NumberField fieldPath="myNum" helpLink="https://example.com" />,
      { myNum: 0 }
    );
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });
});

describe('MapField', () => {
  test('renders with placeholder', () => {
    renderWithFormik(
      <SelectWithCustomOptions
        fieldPath="myOption"
        placeholder="Select an option"
        options={[{ label: 'Option A' }, { label: 'Option B' }]}
      />,
      { myOption: '' }
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  test('renders with selected value', () => {
    renderWithFormik(
      <SelectWithCustomOptions
        fieldPath="myOption"
        placeholder="Select"
        options={[{ label: 'Option A' }]}
      />,
      { myOption: 'Option A' }
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });
});

describe('MapField', () => {
  const { MapField } = require('./map_field');

  test('renders with label', () => {
    renderWithFormik(<MapField fieldPath="myMap" label="Field Mapping" />, {
      myMap: [{ key: '', value: '' }],
    });
    expect(screen.getByText('Field Mapping')).toBeInTheDocument();
  });

  test('renders add entry button', () => {
    renderWithFormik(
      <MapField fieldPath="myMap" addEntryButtonText="Add field" />,
      { myMap: [] }
    );
    expect(screen.getByText('Add field')).toBeInTheDocument();
  });
});

describe('MapArrayField', () => {
  const { MapArrayField } = require('./map_array_field');

  test('renders configure button when empty', () => {
    renderWithFormik(
      <MapArrayField fieldPath="myMapArray" />,
      { myMapArray: [] }
    );
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  test('renders map content for single populated map', () => {
    renderWithFormik(
      <MapArrayField fieldPath="myMapArray" />,
      { myMapArray: [[{ key: 'k', value: 'v' }]] }
    );
    // Single populated map renders a panel with MapField inside
    expect(screen.getByDisplayValue('k')).toBeInTheDocument();
  });
});

describe('ModelField', () => {
  const React = require('react');
  const { render: rtlRender, screen: rtlScreen } = require('@testing-library/react');
  const { Provider } = require('react-redux');
  const { Formik: FormikProvider } = require('formik');
  const { BrowserRouter } = require('react-router-dom');
  const configureStore = require('redux-mock-store').default;
  const { INITIAL_ML_STATE } = require('../../../../store');
  const { ModelField } = require('./model_field');

  const mockStore = configureStore([]);

  function renderModelField(props: any = {}, formValues: any = {}) {
    const store = mockStore({
      ml: {
        ...INITIAL_ML_STATE,
        models: {
          model1: { id: 'model1', name: 'Test Model', state: 'DEPLOYED', algorithm: 'TEXT_EMBEDDING', interface: {} },
        },
      },
      opensearch: { indices: {}, errorMessage: '' },
      errors: { loading: false, errorMessage: '' },
      workflows: {},
      presets: {},
    });

    return rtlRender(
      <Provider store={store}>
        <BrowserRouter>
          <FormikProvider initialValues={formValues} onSubmit={jest.fn()}>
            <ModelField fieldPath="myModel" {...props} />
          </FormikProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  test('renders model label', () => {
    renderModelField({}, { myModel: { id: '', algorithm: undefined } });
    expect(rtlScreen.getByText('Model')).toBeInTheDocument();
  });

  test('renders custom label', () => {
    renderModelField({ label: 'LLM Model' }, { myModel: { id: '', algorithm: undefined } });
    expect(rtlScreen.getByText('LLM Model')).toBeInTheDocument();
  });

  test('renders refresh button', () => {
    renderModelField({}, { myModel: { id: '', algorithm: undefined } });
    expect(rtlScreen.getByLabelText('refresh')).toBeInTheDocument();
  });
});

describe('ModelInfoPopover', () => {
  const { ModelInfoPopover } = require('./models_info_popover');
  const { MODEL_CATEGORY } = require('../../../../../common');

  test('renders learn more button', () => {
    render(<ModelInfoPopover modelCategory={MODEL_CATEGORY.EMBEDDING} />);
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  test('shows embedding model links when opened', () => {
    render(<ModelInfoPopover modelCategory={MODEL_CATEGORY.EMBEDDING} />);
    fireEvent.click(screen.getByText('Learn more'));
    expect(screen.getByText('Cohere Embed')).toBeInTheDocument();
  });

  test('shows LLM model links when opened', () => {
    render(<ModelInfoPopover modelCategory={MODEL_CATEGORY.LLM} />);
    fireEvent.click(screen.getByText('Learn more'));
    expect(screen.getByText('OpenAI GPT-3.5')).toBeInTheDocument();
  });

  test('shows sparse encoder links when opened', () => {
    render(<ModelInfoPopover modelCategory={MODEL_CATEGORY.SPARSE_ENCODER} />);
    fireEvent.click(screen.getByText('Learn more'));
    expect(screen.getByText('OpenSearch Neural Sparse Encoder')).toBeInTheDocument();
  });
});
