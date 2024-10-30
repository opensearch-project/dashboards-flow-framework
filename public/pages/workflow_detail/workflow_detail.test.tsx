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
      expect(getAllByText('Create an ingest pipeline').length).toBeGreaterThan(
        0
      );
      expect(getAllByText('Skip ingestion pipeline').length).toBeGreaterThan(0);
      expect(getAllByText('Define ingest pipeline').length).toBeGreaterThan(0);
      expect(getAllByText('Inspector').length).toBeGreaterThan(0);
      expect(getAllByText('Preview').length).toBeGreaterThan(0);
      expect(
        getAllByText((content) => content.startsWith('Last updated:')).length
      ).toBeGreaterThan(0);
      expect(getAllByText('Search pipeline').length).toBeGreaterThan(0);
      expect(getByText('Close')).toBeInTheDocument();
      expect(getByText('Export')).toBeInTheDocument();
      expect(getByText('Visual')).toBeInTheDocument();
      expect(getByText('JSON')).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Ingest response' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Search response' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Errors' })).toBeInTheDocument();
      expect(getByRole('tab', { name: 'Resources' })).toBeInTheDocument();

      // "Run ingestion" button should be enabled by default
      const runIngestionButton = getByTestId('runIngestionButton');
      expect(runIngestionButton).toBeInTheDocument();
      expect(runIngestionButton).toBeEnabled();

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
      expect(getByText(`Export ${workflowName}`)).toBeInTheDocument();
    });

    // Close the export component
    userEvent.click(getByTestId('exportCloseButton'));

    // Check workspace buttons (Visual and JSON)
    const visualButton = getByTestId('workspaceVisualButton');
    await waitFor(() => {
      expect(visualButton).toBeVisible();
    });
    expect(visualButton).toHaveClass('euiFilterButton-hasActiveFilters');
    const jsonButton = getByTestId('workspaceJSONButton');
    expect(jsonButton).toBeVisible();
    userEvent.click(jsonButton);
    await waitFor(() => {
      expect(jsonButton).toHaveClass('euiFilterButton-hasActiveFilters');
    });

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

describe('WorkflowDetail Page with skip ingestion option (Hybrid Search Workflow)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test(`renders the WorkflowDetail page with skip ingestion option`, async () => {
    const {
      container,
      getByTestId,
      getAllByText,
      getAllByTestId,
    } = renderWithRouter(workflowId, workflowName, WORKFLOW_TYPE.HYBRID_SEARCH);

    // "Create an ingest pipeline" option should be selected by default
    const createIngestRadio = container.querySelector('#create');
    expect(createIngestRadio).toBeChecked();

    // "Skip ingestion pipeline" option should be unselected by default
    const skipIngestRadio = container.querySelector('#skip');
    expect(skipIngestRadio).not.toBeChecked();

    // Selected "Skip ingestion pipeline"
    userEvent.click(skipIngestRadio!);
    await waitFor(() => {
      expect(createIngestRadio).not.toBeChecked();
    });
    expect(skipIngestRadio).toBeChecked();
    const searchPipelineButton = getByTestId('searchPipelineButton');
    userEvent.click(searchPipelineButton);

    // Search pipeline
    await waitFor(() => {
      expect(getAllByText('Define search pipeline').length).toBeGreaterThan(0);
    });
    expect(getAllByText('Configure query').length).toBeGreaterThan(0);
    const searchTestButton = getByTestId('searchTestButton');
    expect(searchTestButton).toBeInTheDocument();

    // Edit Search Query
    const queryEditButton = getByTestId('queryEditButton');
    expect(queryEditButton).toBeInTheDocument();
    userEvent.click(queryEditButton);
    await waitFor(() => {
      expect(getAllByText('Edit query').length).toBeGreaterThan(0);
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
      expect(getAllByText('PROCESSORS').length).toBeGreaterThan(0);
    });

    // Add response processor
    const addResponseProcessorButton = getAllByTestId('addProcessorButton')[1];
    userEvent.click(addResponseProcessorButton);
    await waitFor(() => {
      expect(getAllByText('PROCESSORS').length).toBeGreaterThan(0);
    });

    // Build and Run query, Back buttons are present
    expect(getByTestId('runQueryButton')).toBeInTheDocument();
    const searchPipelineBackButton = getByTestId('searchPipelineBackButton');
    userEvent.click(searchPipelineBackButton);

    await waitFor(() => {
      expect(skipIngestRadio).toBeChecked();
    });
  });
});
