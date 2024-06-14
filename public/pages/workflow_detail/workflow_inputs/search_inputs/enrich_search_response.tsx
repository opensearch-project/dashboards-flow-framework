/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsTitle } from '../../../../general_components';
import { PROCESSOR_CONTEXT, WorkflowConfig } from '../../../../../common';
import { ProcessorsList } from '../processors_list';

interface EnrichSearchResponseProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  onFormChange: () => void;
}

/**
 * Input component for enriching a search response (configuring search response processors, etc.)
 */
export function EnrichSearchResponse(props: EnrichSearchResponseProps) {
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Enhance query results"
        processorCount={
          props.uiConfig.search?.enrichRequest?.processors?.length || 0
        }
      />
      <EuiFlexItem>
        <ProcessorsList
          onFormChange={props.onFormChange}
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
