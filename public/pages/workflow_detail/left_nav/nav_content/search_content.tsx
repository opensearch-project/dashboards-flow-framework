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
import { NavComponent, ProcessorsComponent } from './nav_components';

interface SearchContentProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

/**
 * The base component for rendering the search-related components, including real-time provisioning / error states.
 */
export function SearchContent(props: SearchContentProps) {
  const DownArrow = () => (
    <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
      <EuiIcon type="sortDown" size="l" />
    </EuiFlexItem>
  );

  return (
    <>
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
      <DownArrow />
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
      <DownArrow />
      <EuiFlexItem grow={false}>
        <NavComponent
          title="Retrieve from data source"
          icon="indexSettings"
          onClick={() => {
            console.log('retrieve from data source clicked');
          }}
        />
      </EuiFlexItem>
      <DownArrow />
      <EuiFlexItem grow={false}>
        <ProcessorsComponent
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          title="Transform results"
          context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
          setCachedFormikState={props.setCachedFormikState}
          setSelectedComponentId={props.setSelectedComponentId}
        />
      </EuiFlexItem>
      <DownArrow />
      <EuiFlexItem grow={false}>
        <NavComponent
          title="Search results"
          icon="document"
          onClick={() => {
            console.log('search results clicked');
          }}
        />
      </EuiFlexItem>
    </>
  );
}
