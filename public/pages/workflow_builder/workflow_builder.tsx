/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import {
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
// import { AppState, removeDirty, setComponents } from '../../store';

export function WorkflowBuilder() {
  // TODO: below commented out lines can be used for fetching & setting global redux state
  // const dispatch = useDispatch();
  // const { isDirty, components } = useSelector(
  //   (state: AppState) => state.workspace
  // );

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOW_BUILDER,
    ]);
  });

  return (
    <div>
      <EuiPageHeader>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="l">
              <h1>Workflow Builder</h1>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageHeader>
      <EuiSpacer size="l" />
      <EuiFlexItem>
        <EuiText>Workspace</EuiText>
      </EuiFlexItem>
    </div>
  );
}
