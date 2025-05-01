/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

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
  COMPONENT_ID,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { BooleanField } from '../../workflow_inputs';
import { NavComponent, ProcessorsComponent } from './nav_components';
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
          <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
            <EuiIcon type="sortDown" size="l" />
          </EuiFlexItem>
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
          <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
            <EuiIcon type="sortDown" size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Index"
              icon="indexSettings"
              onClick={() => {
                props.setSelectedComponentId(COMPONENT_ID.INGEST_DATA);
              }}
            />
          </EuiFlexItem>
          <EuiHorizontalRule margin="s" />
          <EuiFlexItem grow={false} style={{ marginTop: '-16px' }}>
            <EuiFlexGroup direction="row" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <h2>{'Search flow'}</h2>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ paddingTop: '8px' }}>
                <EuiText>TODO add state</EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Search request"
              icon="editorCodeBlock"
              onClick={() => {
                props.setSelectedComponentId(COMPONENT_ID.SEARCH_REQUEST);
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
            <EuiIcon type="sortDown" size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ProcessorsComponent
              uiConfig={props.uiConfig}
              setUiConfig={props.setUiConfig}
              title="Transform query"
              context={PROCESSOR_CONTEXT.SEARCH_REQUEST}
              setCachedFormikState={props.setCachedFormikState}
              setSelectedComponentId={props.setSelectedComponentId}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}
