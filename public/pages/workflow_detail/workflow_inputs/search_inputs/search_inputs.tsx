/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { ConfigureSearchRequest } from './configure_search_request';
import { EnrichSearchRequest } from './enrich_search_request';
import { EnrichSearchResponse } from './enrich_search_response';
import { WorkflowConfig } from '../../../../../common';

interface SearchInputsProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  onFormChange: () => void;
}

/**
 * The base component containing all of the search-related inputs
 */
export function SearchInputs(props: SearchInputsProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <ConfigureSearchRequest />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichSearchRequest
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichSearchResponse
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          onFormChange={props.onFormChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
