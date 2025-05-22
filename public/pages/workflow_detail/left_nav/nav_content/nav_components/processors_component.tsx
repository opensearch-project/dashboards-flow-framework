/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { NavComponent } from './nav_component';
import {
  CachedFormikState,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../../common';
import { ProcessorList } from './processor_list';

interface ProcessorsComponentProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  title: string;
  context: PROCESSOR_CONTEXT;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  selectedComponentId: string;
  setSelectedComponentId: (id: string) => void;
  disabled?: boolean;
}

/**
 * The reusable parent nav component containing the list of processors.
 * Takes in a "title" and "context" param to determine what processors
 * to display (ingest vs. search request vs. search response)
 */
export function ProcessorsComponent(props: ProcessorsComponentProps) {
  return (
    <NavComponent
      //title={props.title}
      //icon="compute"
      body={
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem
            grow={false}
            style={{ marginTop: '8px', marginBottom: '8px' }}
          >
            <EuiFlexGroup direction="row" justifyContent="center">
              <EuiText size="xs" color="subdued">
                {props.title}
              </EuiText>
            </EuiFlexGroup>
          </EuiFlexItem>

          <div style={{ padding: '0px' }}>
            <ProcessorList
              uiConfig={props.uiConfig}
              setUiConfig={props.setUiConfig}
              context={props.context}
              setCachedFormikState={props.setCachedFormikState}
              selectedComponentId={props.selectedComponentId}
              setSelectedComponentId={props.setSelectedComponentId}
              disabled={props.disabled}
            />
          </div>
        </EuiFlexGroup>
      }
      isDisabled={false}
    />
  );
}
