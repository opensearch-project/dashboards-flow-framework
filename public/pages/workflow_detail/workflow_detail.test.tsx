/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouteComponentProps, Route, Switch, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
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

jest.setTimeout(10000);

const workflowId = '12345';
const workflowName = 'test_workflow';

window.ResizeObserver = resizeObserverMock;

const renderWithRouter = (
  workflowId: string,
  workflowName: string,
  workflowType: WORKFLOW_TYPE
) => {
  const history = createMemoryHistory({
    initialEntries: [`/workflow/${workflowId}`],
  });

  return {
    ...render(
      <Provider store={mockStore(workflowId, workflowName, workflowType)}>
        <Router history={history}>
          <Switch>
            <Route
              path="/workflow/:workflowId"
              render={(
                props: RouteComponentProps<WorkflowDetailRouterProps>
              ) => {
                return <WorkflowDetail setActionMenu={jest.fn()} {...props} />;
              }}
            />
          </Switch>
        </Router>
      </Provider>
    ),
    history,
  };
};

describe('WorkflowDetail Page with create ingestion option', () => {
  Object.values(WORKFLOW_TYPE).forEach((type) => {
    test(`renders the page with ${type} type`, async () => {
      const {
        getAllByText,
        getByText,
        getByRole,
        container,
        getByTestId,
        history,
      } = renderWithRouter(workflowId, workflowName, type);

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

      // "Run ingestion" button should be enabled by default
      const runIngestionButton = getByTestId('runIngestionButton');
      expect(runIngestionButton).toBeInTheDocument();
      expect(runIngestionButton).toBeEnabled();

      // "Search pipeline >" button should be disabled by default
      const searchPipelineButton = getByTestId('searchPipelineButton');
      expect(searchPipelineButton).toBeInTheDocument();
      expect(searchPipelineButton).toBeDisabled();

      // "Create an ingest pipeline" option should be selected by default
      const createIngestRadio = container.querySelector('#create');
      expect(createIngestRadio).toBeChecked();

      // "Skip ingestion pipeline" option should be disabled by default
      const skipIngestRadio = container.querySelector('#skip');
      expect(skipIngestRadio).not.toBeChecked();

      // Clicking the "Export" button should open the export component
      await waitFor(() => userEvent.click(getByTestId('exportButton')));
      expect(getByText('Export ' + workflowName)).toBeInTheDocument();
      // Closing the "Export" opened above
      await waitFor(() => userEvent.click(getByTestId('exportCloseButton')));

      // Testing components in the ReactFlow workspace
      const visualButton = getByTestId('workspaceVisualButton');
      expect(visualButton).toBeVisible();
      expect(visualButton).toHaveClass('euiFilterButton-hasActiveFilters');
      const jsonButton = getByTestId('workspaceJSONButton');
      expect(jsonButton).toBeVisible();
      await waitFor(() => userEvent.click(jsonButton));
      expect(jsonButton).toHaveClass('euiFilterButton-hasActiveFilters');

      // Testing collapsible Tools panel
      const toolsPanelInitially = container.querySelector('#tools_panel_id');
      expect(toolsPanelInitially).toBeVisible();

      const toggleButton = toolsPanelInitially?.querySelector(
        'button[type="button"]'
      );
      expect(toggleButton).toBeInTheDocument();
      await waitFor(() => userEvent.click(toggleButton!));

      // Testing Tools panel after collapse
      const toolsPanelAfterCollapse = container.querySelector(
        '#tools_panel_id'
      )!;
      expect(toolsPanelAfterCollapse).toHaveClass(
        'euiResizablePanel-isCollapsed'
      );

      // Testing Tools panel after expand
      await waitFor(() => userEvent.click(toggleButton!));
      const toolsPanelAfterExpand = container.querySelector('#tools_panel_id')!;
      expect(toolsPanelAfterExpand).not.toHaveClass(
        'euiResizablePanel-isCollapsed'
      );

      // Clicking the WorkflowDetail Page "close" button should go back to the list page
      await waitFor(() => userEvent.click(getByTestId('closeButton')));
      expect(history.location.pathname).toBe('/workflows');
    });
  });
});
