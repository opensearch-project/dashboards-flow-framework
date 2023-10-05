/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiPageHeader,
  EuiTitle,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
} from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowList } from './workflow_list';
import { NewWorkflow } from './new_workflow';

enum WORKFLOWS_TAB {
  MANAGE = 'manage',
  CREATE = 'create',
}

export function Workflows() {
  const [selectedTabId, setSelectedTabId] = useState<WORKFLOWS_TAB>(
    WORKFLOWS_TAB.MANAGE
  );

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader
          pageTitle="Workflows"
          tabs={[
            {
              id: WORKFLOWS_TAB.MANAGE,
              label: 'Manage workflows',
              isSelected: selectedTabId === WORKFLOWS_TAB.MANAGE,
              onClick: () => {
                setSelectedTabId(WORKFLOWS_TAB.MANAGE);
              },
            },
            {
              id: WORKFLOWS_TAB.CREATE,
              label: 'New workflow',
              isSelected: selectedTabId === WORKFLOWS_TAB.CREATE,
              onClick: () => {
                setSelectedTabId(WORKFLOWS_TAB.CREATE);
              },
            },
          ]}
        />

        <EuiPageContent>
          <EuiTitle>
            <h2>
              {selectedTabId === WORKFLOWS_TAB.MANAGE && 'Workflows'}
              {selectedTabId === WORKFLOWS_TAB.CREATE &&
                'Create a new workflow'}
            </h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          {selectedTabId === WORKFLOWS_TAB.MANAGE && <WorkflowList />}
          {selectedTabId === WORKFLOWS_TAB.CREATE && <NewWorkflow />}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
