/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsTitle } from '../../../../general_components';
import {
  CachedFormikState,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { ProcessorsList } from '../processors_list';

interface EnrichSearchRequestProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
}

/**
 * Input component for enriching a search request (configuring search request processors, etc.)
 */
export function EnrichSearchRequest(props: EnrichSearchRequestProps) {
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Transform query"
        processorCount={
          props.uiConfig.search.enrichRequest.processors?.length || 0
        }
        optional={false}
      />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.SEARCH_REQUEST}
          setCachedFormikState={props.setCachedFormikState}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
