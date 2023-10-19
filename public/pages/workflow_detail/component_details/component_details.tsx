/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';
import { ReactFlowComponent } from '../../../../common';
import { ComponentInputs } from './component_inputs';
import { EmptyComponentInputs } from './empty_component_inputs';

// styling
import '../workspace/workspace-styles.scss';

interface ComponentDetailsProps {
  selectedComponent?: ReactFlowComponent;
}

/**
 * A panel that will be nested in a resizable container to dynamically show
 * the details and user-required inputs based on the selected component
 * in the flow workspace.
 */
export function ComponentDetails(props: ComponentDetailsProps) {
  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      className="workspace-panel"
    >
      <EuiFlexItem>
        <EuiPanel paddingSize="m">
          {props.selectedComponent ? (
            <ComponentInputs selectedComponent={props.selectedComponent} />
          ) : (
            <EmptyComponentInputs />
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
