/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPanel } from '@elastic/eui';
import { ReactFlowComponent, Workflow } from '../../../../common';
import { ComponentInputs } from './component_inputs';
import { EmptyComponentInputs } from './empty_component_inputs';
import { ProvisionedComponentInputs } from './provisioned_component_inputs';

// styling
import '../workspace/workspace-styles.scss';

interface ComponentDetailsProps {
  workflow: Workflow | undefined;
  onFormChange: () => void;
  isDeprovisionable: boolean;
  selectedComponent?: ReactFlowComponent;
}

/**
 * A panel that will be nested in a resizable container to dynamically show
 * the details and user-required inputs based on the selected component
 * in the flow workspace.
 */
export function ComponentDetails(props: ComponentDetailsProps) {
  return (
    <EuiPanel paddingSize="m">
      {/* TODO: determine if we need this view if we want the workspace to remain
      readonly once provisioned */}
      {/* {props.isDeprovisionable ? (
        <ProvisionedComponentInputs />
      ) : */}
      {props.selectedComponent ? (
        <ComponentInputs
          selectedComponent={props.selectedComponent}
          onFormChange={props.onFormChange}
        />
      ) : props.workflow ? (
        <EmptyComponentInputs />
      ) : undefined}
    </EuiPanel>
  );
}
