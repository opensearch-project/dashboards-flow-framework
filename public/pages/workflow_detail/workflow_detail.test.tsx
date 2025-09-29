/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouteComponentProps, Route, Switch, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { WorkflowDetail } from './workflow_detail';
import { WorkflowDetailRouterProps } from '../../pages';
import '@testing-library/jest-dom';
import { mockStore, resizeObserverMock } from '../../../test/utils';
import { createMemoryHistory } from 'history';
import { MINIMUM_FULL_SUPPORTED_VERSION, WORKFLOW_TYPE } from '../../../common';
import { sleep } from '../../utils';

// // Mock the AgenticSearchWorkspace component
// jest.mock('./agentic_search/agentic_search_workspace', () => ({
//   AgenticSearchWorkspace: () => (
//     <div data-testid="mockAgenticSearchWorkspace">
//       <div data-testid="agenticSearchInputPanel">
//         <h3>Configure agent</h3>
//         <span>EXPERIMENTAL</span>
//       </div>
//       <div data-testid="agenticSearchTestPanel">Test Flow Panel</div>
//     </div>
//   ),
// }));

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

      // All workflow types should have the same header content
      expect(getAllByText(workflowName).length).toBeGreaterThan(0);
      expect(
        getAllByText((content) => content.startsWith('Last saved:')).length
      ).toBeGreaterThan(0);
      expect(getByText('Close')).toBeInTheDocument();
      expect(getByText('Export')).toBeInTheDocument();

      // Agentic search vs. non-agentic search use cases have different content within the details page.
      if (type === WORKFLOW_TYPE.AGENTIC_SEARCH) {
        expect(getByTestId('agenticSearchInputPanel')).toBeInTheDocument();
        expect(getByTestId('agenticSearchTestPanel')).toBeInTheDocument();
      } else {
        expect(getAllByText('Flow overview').length).toBeGreaterThan(0);
        expect(getAllByText('Ingest flow').length).toBeGreaterThan(0);
        expect(getAllByText('Search flow').length).toBeGreaterThan(0);
        expect(getAllByText('Inspect').length).toBeGreaterThan(0);
        expect(getByRole('tab', { name: 'Test flow' })).toBeInTheDocument();
        expect(
          getByRole('tab', { name: 'Ingest response' })
        ).toBeInTheDocument();
        expect(getByRole('tab', { name: 'Errors' })).toBeInTheDocument();
        expect(getByRole('tab', { name: 'Resources' })).toBeInTheDocument();
        expect(getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
      }
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
});

describe('WorkflowDetail Page with skip ingestion option (Hybrid Search Workflow)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`renders the WorkflowDetail page with skip ingestion option`, async () => {
    const { getByTestId } = renderWithRouter(
      workflowId,
      workflowName,
      WORKFLOW_TYPE.HYBRID_SEARCH
    );

    const leftNavPanel = getByTestId('leftNavPanel');
    expect(within(leftNavPanel).queryByText('Disabled')).toBeNull();

    // Disable ingest
    userEvent.click(getByTestId('toggleIngestButtonSwitch'));
    await sleep(500);
    userEvent.click(getByTestId('toggleIngestButton'));
    await sleep(500);
    expect(
      within(getByTestId('componentInputPanel')).getByText('Sample query')
    );
    expect(within(leftNavPanel).getByText('Disabled')).toBeInTheDocument();
    expect(within(leftNavPanel).getByText('Not created')).toBeInTheDocument();

    // Re-enable ingest
    userEvent.click(getByTestId('toggleIngestButtonSwitch'));
    await sleep(500);
    userEvent.click(getByTestId('toggleIngestButton'));
    await sleep(500);
    expect(within(leftNavPanel).queryByText('Disabled')).toBeNull();
  });
});
