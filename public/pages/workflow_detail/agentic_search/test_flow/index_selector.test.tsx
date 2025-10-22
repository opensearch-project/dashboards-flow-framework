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

  test('renders the component ', () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    expect(screen.getByText('Index')).toBeInTheDocument();

    const indexSelector = screen.getByTestId('indexSelector');
    expect(indexSelector).toBeInTheDocument();
  });

  test('system indices hidden', () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    expect(screen.getByText('Index')).toBeInTheDocument();

    const indexSelector = screen.getByTestId('indexSelector');
    indexSelector.click();

    expect(screen.queryByText('.system')).not.toBeInTheDocument();
  });

  test('all indices option is hidden for flow agents', () => {
    renderIndexSelector(AGENT_TYPE.FLOW);

    expect(screen.getByText('Index')).toBeInTheDocument();

    const indexSelector = screen.getByTestId('indexSelector');
    indexSelector.click();

    expect(screen.getByText('index1')).toBeInTheDocument();
    expect(screen.getByText('index2')).toBeInTheDocument();
    expect(screen.queryByText('All indices')).not.toBeInTheDocument();
  });

  test('all indices option is visible for conversational agents', () => {
    renderIndexSelector(AGENT_TYPE.CONVERSATIONAL);

    expect(screen.getByText('Index')).toBeInTheDocument();

    const indexSelector = screen.getByTestId('indexSelector');
    indexSelector.click();

    expect(screen.getByText('index1')).toBeInTheDocument();
    expect(screen.getByText('index2')).toBeInTheDocument();
    expect(screen.getByText('All indices')).toBeInTheDocument();
  });
});
