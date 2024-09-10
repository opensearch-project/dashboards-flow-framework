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

describe('WorkflowDetail', () => {
  Object.values(WORKFLOW_TYPE).forEach((type) => {
    test(`renders the page with ${type} type`, async () => {
      const {
        getAllByText,
        getByText,
        getByRole,
        container,
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
      const runIngestionButton = getByRole('button', { name: 'Run ingestion' });
      expect(runIngestionButton).toBeInTheDocument();
      expect(runIngestionButton).toBeEnabled();

      // "Search pipeline >" button should be disabled by default
      const searchPipelineButton = getByRole('button', {
        name: 'Search pipeline >',
      });
      expect(searchPipelineButton).toBeInTheDocument();
      expect(searchPipelineButton).toBeDisabled();

      // "Create an ingest pipeline" option should be selected by default
      const createIngestRadio = getByRole('radio', {
        name: /Create an ingest pipeline Configure and ingest data into an index./,
      });
      expect(createIngestRadio).toBeChecked();

      // "Skip ingestion pipeline" option should be disabled by default
      const skipIngestRadio = getByRole('radio', {
        name: /Skip ingestion pipeline Use an existing index with data ingested./,
      });
      expect(skipIngestRadio).not.toBeChecked();

      // Clicking the "Export" button should open the export component
      await waitFor(() =>
        userEvent.click(getByRole('button', { name: 'Export' }))
      );
      expect(getByText('Export ' + workflowName)).toBeInTheDocument();
      // Closing the "Export" opened above
      await waitFor(() =>
        userEvent.click(getByRole('button', { name: 'Close' }))
      );

      // Testing components in the ReactFlow workspace
      const visualButton = getByRole('button', { name: 'Visual' });
      expect(visualButton).toBeVisible();
      expect(visualButton).toHaveClass('euiFilterButton-hasActiveFilters');
      const jsonButton = getByRole('button', { name: 'JSON' });
      expect(jsonButton).toBeVisible();
      await waitFor(() => userEvent.click(jsonButton));
      expect(jsonButton).toHaveClass('euiFilterButton-hasActiveFilters');

      // Testing collapsible Tools panel
      // Get the initial state of the Tools panel
      const toolsPanelInitially = container.querySelector('#tools_panel_id');
      expect(toolsPanelInitially).toBeVisible();
      // Find and click the button to adjust panel sizes
      const adjustPanelSizeButton = container.querySelector(
        'button[aria-label="Press up or down to adjust panels size"].euiResizableButton--vertical'
      );
      expect(adjustPanelSizeButton).toBeInTheDocument();
      await waitFor(() => userEvent.click(adjustPanelSizeButton!));
      // Find the toggle button for the Tools panel
      const toggleButton = container.querySelector(
        'button[aria-label="Press to toggle this panel"].euiResizableToggleButton--vertical'
      );
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('euiResizableToggleButton-isVisible');
      // Collapse the Tools panel
      await waitFor(() => userEvent.click(toggleButton!));
      const toolsPanelAfterCollapse = container.querySelector(
        '#tools_panel_id'
      )!;
      expect(toolsPanelAfterCollapse).toHaveClass(
        'euiResizablePanel-isCollapsed'
      );
      // Expand the Tools panel
      await waitFor(() => userEvent.click(toggleButton!));
      const toolsPanelAfterExpand = container.querySelector('#tools_panel_id')!;
      expect(toolsPanelAfterExpand).not.toHaveClass(
        'euiResizablePanel-isCollapsed'
      );

      // Clicking the "close" button should go back to the list page
      await waitFor(() =>
        userEvent.click(getByRole('button', { name: 'Close' }))
      );
      expect(history.location.pathname).toBe('/workflows');
    });
  });
});
