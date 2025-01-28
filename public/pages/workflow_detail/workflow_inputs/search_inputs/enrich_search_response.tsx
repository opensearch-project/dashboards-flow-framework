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

interface EnrichSearchResponseProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
}

/**
 * Input component for enriching a search response (configuring search response processors, etc.)
 */
export function EnrichSearchResponse(props: EnrichSearchResponseProps) {
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Transform response"
        processorCount={
          props.uiConfig.search.enrichResponse.processors?.length || 0
        }
        optional={false}
      />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
          setCachedFormikState={props.setCachedFormikState}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
