/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsList } from './processors_list';
import { WorkflowConfig } from '../../../../../common';
import { ProcessorsTitle } from '../../../../general_components';

interface EnrichDataProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * Base component for configuring any data enrichment
 */
export function EnrichData(props: EnrichDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Enrich data"
        processorCount={props.uiConfig.ingest.enrich.processors?.length || 0}
      />
      <EuiFlexItem>
        <ProcessorsList
          onFormChange={props.onFormChange}
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
