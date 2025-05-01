/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiLoadingSpinner,
  EuiText,
} from '@elastic/eui';
import {
  CachedFormikState,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { uiConfigToWorkspaceFlow } from '../../../../utils';
import { BooleanField } from '../../workflow_inputs';
import { NavComponent, TransformData } from './nav_components';
/**
 * Base component for rendering processor form inputs based on the processor type
 */

interface NavContentProps {
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function NavContent(props: NavContentProps) {
  useEffect(() => {
    if (props.uiConfig) {
      const proposedWorkspaceFlow = uiConfigToWorkspaceFlow(props.uiConfig);
      console.log('proposed flow: ', proposedWorkspaceFlow);
    }
  }, [props.uiConfig]);

  return (
    <>
      {props.uiConfig === undefined ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        <EuiFlexGroup
          direction="column"
          justifyContent="spaceBetween"
          gutterSize="none"
          style={{
            height: '100%',
            gap: '16px',
          }}
        >
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <h2>{'Ingest flow'}</h2>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" gutterSize="s">
                  <EuiFlexItem grow={false} style={{ marginTop: '20px' }}>
                    <BooleanField
                      fieldPath="ingest.enabled"
                      label="Enable ingest flow"
                      type="Switch"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiHorizontalRule margin="m" />
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Sample data"
              icon="document"
              onClick={() => {
                props.setSelectedComponentId('ingest.docs');
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
            <EuiIcon type="sortDown" size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <TransformData
              uiConfig={props.uiConfig}
              setUiConfig={props.setUiConfig}
              context={PROCESSOR_CONTEXT.INGEST}
              setCachedFormikState={props.setCachedFormikState}
              setSelectedComponentId={props.setSelectedComponentId}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
            <EuiIcon type="sortDown" size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Index"
              icon="indexSettings"
              onClick={() => {
                props.setSelectedComponentId('ingest.index');
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}
