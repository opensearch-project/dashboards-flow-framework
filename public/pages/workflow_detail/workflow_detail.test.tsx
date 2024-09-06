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
  Router,
  Redirect,
} from 'react-router-dom';
import { WorkflowDetail } from './workflow_detail';
import { WorkflowDetailRouterProps } from '../../pages';
import '@testing-library/jest-dom';
import { mockStore, resizeObserverMock } from '../../../test/utils';
import { createMemoryHistory } from 'history';
import { WORKFLOW_TYPE } from '../../../common';

jest.mock('../../services', () => {
  const { mockCoreServices } = require('../../../test');
  return {
    ...jest.requireActual('../../services'),
    ...mockCoreServices,
  };
});

const history = createMemoryHistory();
window.ResizeObserver = resizeObserverMock;

const renderWithRouter = (
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
) => ({
  ...render(
    <Provider store={mockStore(workflowId, workflowName, workflowType)}>
      <Router history={history}>
        <Switch>
          <Route
            path="/workflow/:workflowId"
            render={(props: RouteComponentProps<WorkflowDetailRouterProps>) => {
              return <WorkflowDetail setActionMenu={jest.fn()} {...props} />;
            }}
          />
          <Redirect from="/" to={`/workflow/${workflowId}`} />
        </Switch>
      </Router>
    </Provider>
  ),
});

const workflowId = '12345';
const workflowName = 'test_workflow';

describe('WorkflowDetail', () => {
  Object.values(WORKFLOW_TYPE).forEach((type) => {
    test(`renders the page with ${type} type`, () => {
      const { getAllByText, getByText, getByRole } = renderWithRouter(
        workflowId,
        workflowName,
        type
      );

      expect(getAllByText(workflowName).length).toBeGreaterThan(0);
      expect(getAllByText('Create an ingest pipeline').length).toBeGreaterThan(
        0
      );
      expect(getAllByText('Skip ingestion pipeline').length).toBeGreaterThan(0);
      expect(getAllByText('Define ingest pipeline').length).toBeGreaterThan(0);
      expect(getAllByText('Tools').length).toBeGreaterThan(0);
      expect(getAllByText('Preview').length).toBeGreaterThan(0);
      expect(getAllByText('Not started').length).toBeGreaterThan(0);
      expect(
        getAllByText((content) => content.startsWith('Last updated:')).length
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
});
