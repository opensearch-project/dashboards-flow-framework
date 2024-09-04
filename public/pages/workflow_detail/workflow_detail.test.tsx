/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import {
  RouteComponentProps,
  Route,
  Switch,
  MemoryRouter,
} from 'react-router-dom';
import { WorkflowDetail } from './workflow_detail';
import { WorkflowDetailRouterProps } from '../../pages';
import '@testing-library/jest-dom';
import { mockStore } from '../../../test/utils';

jest.mock('../../services', () => {
  const { mockCoreServices } = require('../../../test');
  return {
    ...jest.requireActual('../../services'),
    ...mockCoreServices,
  };
});

const renderWithRouter = (initialEntries: string[]) =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={initialEntries}>
        <Switch>
          <Route
            path="/workflow/:workflowId"
            render={(props: RouteComponentProps<WorkflowDetailRouterProps>) => (
              <WorkflowDetail setActionMenu={jest.fn()} {...props} />
            )}
          />
        </Switch>
      </MemoryRouter>
    </Provider>
  );

describe('WorkflowDetail', () => {
  test('renders the page with workflowId parameter', () => {
    const workflowId = '12345';
    const { getAllByText, getByText, getByRole } = renderWithRouter([
      `/workflow/${workflowId}`,
    ]);

    expect(getAllByText('test_workflow').length).toBeGreaterThan(0);
    expect(getAllByText('Create an ingest pipeline').length).toBeGreaterThan(0);
    expect(getAllByText('Skip ingestion pipeline').length).toBeGreaterThan(0);
    expect(getAllByText('Define ingest pipeline').length).toBeGreaterThan(0);
    expect(getAllByText('Tools').length).toBeGreaterThan(0);
    expect(getAllByText('Preview').length).toBeGreaterThan(0);
    expect(getAllByText('Not started').length).toBeGreaterThan(0);
    expect(
      getAllByText((content, element) => content.startsWith('Last updated:'))
        .length
    ).toBeGreaterThan(0);
    expect(getAllByText('Search pipeline').length).toBeGreaterThan(0);
    expect(getByText('Close')).toBeInTheDocument();
    expect(getByText('Export')).toBeInTheDocument();
    expect(getByText('Visual')).toBeInTheDocument();
    expect(getByText('JSON')).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Run ingestion' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Run queries' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Errors' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Resources' })).toBeInTheDocument();
  });
});
