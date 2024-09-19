/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { WorkflowList } from './workflow_list';
import { mockStore } from '../../../../test/utils';
import { WORKFLOW_TYPE } from '../../../../common';
import configureStore from 'redux-mock-store';
import { WorkflowInput } from '../../../../test/interfaces';

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

const workflowSet: WorkflowInput[] = Array.from({ length: 20 }, (_, index) => ({
  id: `workflow_id_${index}`,
  name: `workflow_name_${index}`,
  type: Object.values(WORKFLOW_TYPE)[
    Math.floor(Math.random() * Object.values(WORKFLOW_TYPE).length)
  ],
}));

const mockStore1 = configureStore([]);
const initialState = {
  workflows: {
    loading: false,
    errorMessage: '',
    workflows: mockStore(...workflowSet).getState().workflows.workflows, // The `mockStore` used here is from the Test Utils.
  },
};

const store = mockStore1(initialState);

const renderWithRouter = () =>
  render(
    <Provider store={store}>
      <Router>
        <Switch>
          <Route render={() => <WorkflowList setSelectedTabId={jest.fn()} />} />
        </Switch>
      </Router>
    </Provider>
  );

describe('WorkflowList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the page', () => {
    const { getAllByText } = renderWithRouter();
    expect(getAllByText('Manage existing workflows').length).toBeGreaterThan(0);
    expect(getAllByText('Name').length).toBeGreaterThan(0);
    expect(getAllByText('Type').length).toBeGreaterThan(0);
    expect(getAllByText('Last saved').length).toBeGreaterThan(0);
    expect(getAllByText('Actions').length).toBeGreaterThan(0);
    expect(getAllByText('workflow_name_0').length).toBeGreaterThan(0);
  });

  test('sorting functionality', async () => {
    const { container, getAllByText, queryByText } = renderWithRouter();
    expect(getAllByText('workflow_name_0').length).toBeGreaterThan(0);

    const sortButtons = container.querySelectorAll(
      '[data-test-subj="tableHeaderSortButton"]'
    );

    // Sort workflows list by Name
    expect(sortButtons[0]).toBeInTheDocument();
    userEvent.click(sortButtons[0]!);
    await waitFor(() => {
      expect(queryByText('workflow_name_19')).toBeInTheDocument();
      expect(queryByText('workflow_name_0')).toBeNull();
    });
    userEvent.click(sortButtons[0]!);
    await waitFor(() => {
      expect(queryByText('workflow_name_0')).toBeInTheDocument();
      expect(queryByText('workflow_name_9')).toBeInTheDocument();
      expect(queryByText('workflow_name_10')).toBeNull();
      expect(queryByText('workflow_name_19')).toBeNull();
    });

    // Sort workflows list by Type
    expect(sortButtons[1]).toBeInTheDocument();
    userEvent.click(sortButtons[1]!);
    await waitFor(() => {
      expect(getAllByText('Custom').length).toBeGreaterThan(0);
      expect(queryByText('Unknown')).toBeNull();
    });
    userEvent.click(sortButtons[1]!);
    await waitFor(() => {
      expect(queryByText('Unknown')).toBeNull();
      expect(getAllByText('Custom').length).toBeGreaterThan(0);
    });
  });

  test('pagination functionality', async () => {
    const { container, getByText, queryByText } = renderWithRouter();

    // Rows per page 10
    const rowsPerPageButton = container.querySelector(
      '[data-test-subj="tablePaginationPopoverButton"]'
    ) as HTMLButtonElement;
    expect(rowsPerPageButton).toHaveTextContent('Rows per page: 10');

    // Default view 10 items per page
    expect(getByText('workflow_name_0')).toBeInTheDocument();
    expect(queryByText('workflow_name_19')).toBeNull();

    // Navigate to next page
    const nextButton = container.querySelector(
      '[data-test-subj="pagination-button-next"]'
    ) as HTMLButtonElement;
    userEvent.click(nextButton);
    await waitFor(() => {
      expect(getByText('workflow_name_19')).toBeInTheDocument();
      expect(queryByText('workflow_name_0')).toBeNull();
    });

    // Navigate to previous page
    const previousButton = container.querySelector(
      '[data-test-subj="pagination-button-previous"]'
    ) as HTMLButtonElement;
    userEvent.click(previousButton);
    await waitFor(() => {
      expect(getByText('workflow_name_0')).toBeInTheDocument();
      expect(queryByText('workflow_name_19')).toBeNull();
    });
  });

  test('delete action functionality', async () => {
    const { getByText, getByTestId, getAllByLabelText } = renderWithRouter();
    const deleteButtons = getAllByLabelText('Delete');
    userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(getByText('Delete associated resources')).toBeInTheDocument();
    });
    expect(getByTestId('deleteWorkflowButton')).toBeInTheDocument();
    const cancelDeleteWorkflowButton = getByTestId(
      'cancelDeleteWorkflowButton'
    );
    expect(cancelDeleteWorkflowButton).toBeInTheDocument();
    userEvent.click(cancelDeleteWorkflowButton);
  });

  test('view resources functionality', async () => {
    const { getByText, getAllByLabelText } = renderWithRouter();
    const viewResourcesButtons = getAllByLabelText('View resources');
    userEvent.click(viewResourcesButtons[0]);
    await waitFor(() => {
      expect(getByText('No existing resources found')).toBeInTheDocument();
    });
  });
});
