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
import { MINIMUM_FULL_SUPPORTED_VERSION, WORKFLOW_TYPE } from '../../../common';

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

  const mockInput = {
    id: workflowId,
    name: workflowName,
    type: workflowType,
    version: [
      WORKFLOW_TYPE.SEMANTIC_SEARCH,
      WORKFLOW_TYPE.MULTIMODAL_SEARCH,
      WORKFLOW_TYPE.HYBRID_SEARCH,
    ].includes(workflowType)
      ? MINIMUM_FULL_SUPPORTED_VERSION
      : undefined,
  };

  return {
    ...render(
      <Provider store={mockStore(mockInput)}>
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
      expect(getAllByText('Inspect pipeline').length).toBeGreaterThan(0);
      expect(getAllByText('Preview pipeline').length).toBeGreaterThan(0);
      expect(
        getAllByText((content) => content.startsWith('Last saved:')).length
      ).toBeGreaterThan(0);
      expect(getByText('Close')).toBeInTheDocument();
      expect(getByText('Export')).toBeInTheDocument();
      expect(getByText('Visual')).toBeInTheDocument();
      expect(getByText('JSON')).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Ingest response' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Search tool' })).toBeInTheDocument();
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
    global.URL.createObjectURL = jest.fn();
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
    // Tools panel should collapse and expand the toggle
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

describe('WorkflowDetail Page with skip ingestion option (Hybrid Search Workflow)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`renders the WorkflowDetail page with skip ingestion option`, async () => {
    const { getByTestId, getAllByText, getAllByTestId } = renderWithRouter(
      workflowId,
      workflowName,
      WORKFLOW_TYPE.HYBRID_SEARCH
    );
    // Defining a new ingest pipeline & index is enabled by default
    const enabledCheckbox = getByTestId('switch-ingest.enabled');
    // Skipping ingest pipeline and navigating to search
    userEvent.click(enabledCheckbox);
    await waitFor(() => {});

    const searchPipelineButton = getByTestId('searchPipelineButton');
    userEvent.click(searchPipelineButton);
    // Search pipeline
    await waitFor(() => {
      expect(getAllByText('Define search flow').length).toBeGreaterThan(0);
    });
    expect(getAllByText('Configure query').length).toBeGreaterThan(0);
    // Edit Search Query
    const queryEditButton = getByTestId('queryEditButton');
    expect(queryEditButton).toBeInTheDocument();
    userEvent.click(queryEditButton);

    await waitFor(() => {
      expect(getAllByText('Edit query definition').length).toBeGreaterThan(0);
    });

    const searchQueryPresetButton = getByTestId('searchQueryPresetButton');
    expect(searchQueryPresetButton).toBeInTheDocument();
    const updateSearchQueryButton = getByTestId('updateSearchQueryButton');
    expect(updateSearchQueryButton).toBeInTheDocument();
    userEvent.click(updateSearchQueryButton);
    // Add request processor
    const addRequestProcessorButton = await waitFor(
      () => getAllByTestId('addProcessorButton')[0]
    );
    userEvent.click(addRequestProcessorButton);

    await waitFor(() => {
      const popoverPanel = document.querySelector('.euiPopover__panel');
      expect(popoverPanel).toBeTruthy();
    });
    // Add response processor
    const addResponseProcessorButton = getAllByTestId('addProcessorButton')[1];
    userEvent.click(addResponseProcessorButton);
    await waitFor(() => {
      const popoverPanel = document.querySelector('.euiPopover__panel');
      expect(popoverPanel).toBeTruthy();
    });
    // Build and Run query, Back buttons are present
    const searchPipelineBackButton = getByTestId('searchPipelineBackButton');
    userEvent.click(searchPipelineBackButton);

    await waitFor(() => {
      expect(enabledCheckbox).not.toBeChecked();
    });
  });
});
