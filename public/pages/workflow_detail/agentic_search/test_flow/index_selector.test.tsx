/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IndexSelector } from './index_selector';
import { AGENT_TYPE } from '../../../../../common';
import { FormikContext, FormikContextType } from 'formik';
import configureStore from 'redux-mock-store';
import { INITIAL_OPENSEARCH_STATE } from '../../../../store';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../services', () => {
  const { mockCoreServices } = require('../../../../../test/mocks');
  return {
    ...jest.requireActual('../../../../services'),
    ...mockCoreServices,
  };
});

jest.mock('../../../../utils', () => ({
  ...jest.requireActual('../../../../utils'),
  getDataSourceId: jest.fn().mockReturnValue('test-datasource-id'),
}));

jest.mock('../../../../store', () => {
  return {
    ...jest.requireActual('../../../../store'),
    useAppDispatch: jest
      .fn()
      .mockReturnValue(
        jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ unwrap: () => Promise.resolve() })
          )
      ),
  };
});

const mockStore = configureStore([]);

describe('IndexSelector', () => {
  const mockIndices = {
    index1: {
      name: 'index1',
      health: 'green',
      status: 'open',
      docsCount: '100',
    },
    index2: {
      name: 'index2',
      health: 'yellow',
      status: 'open',
      docsCount: '50',
    },
    '.system': {
      name: '.system',
      health: 'green',
      status: 'open',
      docsCount: '10',
    },
  };

  const initialState = {
    opensearch: {
      ...INITIAL_OPENSEARCH_STATE,
      indices: mockIndices,
    },
    workflows: {},
    presets: {},
    ml: { models: {}, loading: false, errorMessage: '' },
    errors: { loading: false, errorMessage: '' },
  };

  const mockFormikContext: FormikContextType<any> = {
    values: {
      search: {
        index: {
          name: '',
        },
      },
    },
  } as FormikContextType<any>;

  // Reusable render function
  const renderIndexSelector = (agentType?: AGENT_TYPE) => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <FormikContext.Provider value={mockFormikContext}>
          <IndexSelector agentType={agentType} />
        </FormikContext.Provider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders selector', () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    const indexSelector = screen.getByTestId('indexSelector');
    expect(indexSelector).toBeInTheDocument();
  });

  test('shows available indices', async () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    const indexSelector = screen.getByTestId('indexSelector');
    await userEvent.click(indexSelector);

    expect(screen.getByText('index1')).toBeInTheDocument();
    expect(screen.getByText('index2')).toBeInTheDocument();
  });

  test('system indices are filtered out', async () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    const indexSelector = screen.getByTestId('indexSelector');
    await userEvent.click(indexSelector);

    expect(screen.queryByText('.system')).not.toBeInTheDocument();
  });

  test('shows placeholder text', () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    expect(screen.getByPlaceholderText('Select an index')).toBeInTheDocument();
  });
});
