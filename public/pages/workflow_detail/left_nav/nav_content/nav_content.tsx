/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiFlexItem, EuiText } from '@elastic/eui';
import { WorkflowConfig } from '../../../../../common';
import { uiConfigToWorkspaceFlow } from '../../../../utils';
/**
 * Base component for rendering processor form inputs based on the processor type
 */

interface NavContentProps {
  uiConfig: WorkflowConfig | undefined;
}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function NavContent(props: NavContentProps) {
  // Initialization. Generate the nodes and edges based on the workflow config.
  useEffect(() => {
    if (props.uiConfig) {
      const proposedWorkspaceFlow = uiConfigToWorkspaceFlow(props.uiConfig);
      console.log('proposed flow: ', proposedWorkspaceFlow);
    }
  }, [props.uiConfig]);
  return (
    <EuiFlexItem>
      <EuiText size="s">Nav content</EuiText>
    </EuiFlexItem>
  );
}
