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
      <Provider
        store={mockStore({
          id: workflowId,
          name: workflowName,
          type: workflowType,
        })}
      >
        <Router history={history}>
          <Switch>
            <Route
              path="/workflow/:workflowId"
              render={(
                props: RouteComponentProps<WorkflowDetailRouterProps>
              ) => <WorkflowDetail setActionMenu={jest.fn()} {...props} />}
            />
          </Switch>
        </Router>
      </Provider>
    ),
    history,
  };
};

describe('WorkflowDetail Page with create ingestion option', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  Object.values(WORKFLOW_TYPE).forEach((type) => {
    test(`renders the WorkflowDetail page with ${type} type`, async () => {
      const {
        getAllByText,
        getByText,
        getByRole,
        getByTestId,
      } = renderWithRouter(workflowId, workflowName, type);

      expect(getAllByText(workflowName).length).toBeGreaterThan(0);
      expect(getAllByText('Inspector').length).toBeGreaterThan(0);
      expect(getAllByText('Preview').length).toBeGreaterThan(0);
      expect(
        getAllByText((content) => content.startsWith('Last updated:')).length
      ).toBeGreaterThan(0);
      expect(getByText('Close')).toBeInTheDocument();
      expect(getByText('Export')).toBeInTheDocument();
      expect(getByText('Visual')).toBeInTheDocument();
      expect(getByText('JSON')).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Ingest response' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Search response' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Errors' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Resources' })).toBeInTheDocument();

      // "Search pipeline" button should be disabled by default
      const searchPipelineButton = getByTestId('searchPipelineButton');
      expect(searchPipelineButton).toBeInTheDocument();
      expect(searchPipelineButton).toBeDisabled();
    });
  });
});

describe('WorkflowDetail Page Functionality (Custom Workflow)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('tests Export button, Tools panel toggling, and Workspace preview', async () => {
    const { getByText, container, getByTestId } = renderWithRouter(
      workflowId,
      workflowName,
      WORKFLOW_TYPE.CUSTOM
    );

    // Export button opens the export component
    userEvent.click(getByTestId('exportButton'));
    await waitFor(() => {
      expect(getByText(`Export '${workflowName}'`)).toBeInTheDocument();
    });

    // Close the export component
    userEvent.click(getByTestId('exportCloseButton'));

    // Check workspace button group exists (Visual and JSON)
    getByTestId('visualJSONToggleButtonGroup');

    // Tools panel should collapse and expand on toggle
    const toolsPanel = container.querySelector('#tools_panel_id');
    expect(toolsPanel).toBeVisible();

    const toggleButton = toolsPanel?.querySelector('button[type="button"]');
    expect(toggleButton).toBeInTheDocument();
    userEvent.click(toggleButton!);

    // Tools panel after collapsing
    const collapsedToolsPanel = container.querySelector('#tools_panel_id');
    await waitFor(() => {
      expect(collapsedToolsPanel).toHaveClass('euiResizablePanel-isCollapsed');
    });

    // Tools panel after expanding
    userEvent.click(toggleButton!);
    const expandedToolsPanel = container.querySelector('#tools_panel_id');
    await waitFor(() => {
      expect(expandedToolsPanel).not.toHaveClass(
        'euiResizablePanel-isCollapsed'
      );
    });
  });

  test('tests navigation to workflows list on Close button click', async () => {
    const { getByTestId, history } = renderWithRouter(
      workflowId,
      workflowName,
      WORKFLOW_TYPE.CUSTOM
    );

    // The WorkflowDetail Page Close button should navigate back to the workflows list
    userEvent.click(getByTestId('closeButton'));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/workflows');
    });
  });
});
