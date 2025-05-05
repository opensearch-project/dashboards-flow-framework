/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui';
import {
  CachedFormikState,
  COMPONENT_ID,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { BooleanField } from '../../workflow_inputs';
import { NavComponent, ProcessorsComponent } from './nav_components';

interface IngestContentProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

/**
 * The base component for rendering the ingest-related components, including real-time provisioning / error states.
 */
export function IngestContent(props: IngestContentProps) {
  const DownArrow = () => (
    <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
      <EuiIcon type="sortDown" size="l" />
    </EuiFlexItem>
  );

  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup direction="row" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <h2>{'Ingest flow'}</h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="s">
              <EuiFlexItem grow={false} style={{ marginTop: '16px' }}>
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
      <EuiFlexItem grow={false}>
        <NavComponent
          title="Source data"
          icon="document"
          onClick={() => {
            props.setSelectedComponentId(COMPONENT_ID.SOURCE_DATA);
          }}
        />
      </EuiFlexItem>
      <DownArrow />
      <EuiFlexItem grow={false}>
        <ProcessorsComponent
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          title="Transform data"
          context={PROCESSOR_CONTEXT.INGEST}
          setCachedFormikState={props.setCachedFormikState}
          setSelectedComponentId={props.setSelectedComponentId}
        />
      </EuiFlexItem>
      <DownArrow />
      <EuiFlexItem grow={false}>
        <NavComponent
          title="Index"
          icon="indexSettings"
          onClick={() => {
            props.setSelectedComponentId(COMPONENT_ID.INGEST_DATA);
          }}
        />
      </EuiFlexItem>
    </>
  );
}
