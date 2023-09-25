/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { AppState } from '../../../store';
import { WorkspaceComponent } from '../workspace_component';

export function Workspace() {
  const { components } = useSelector((state: AppState) => state.workspace);

  return (
    <EuiFlexGroup direction="row">
      {components.map((component, idx) => {
        return (
          <EuiFlexItem key={idx}>
            <WorkspaceComponent component={component} />
          </EuiFlexItem>
        );
      })}
    </EuiFlexGroup>
  );
}
