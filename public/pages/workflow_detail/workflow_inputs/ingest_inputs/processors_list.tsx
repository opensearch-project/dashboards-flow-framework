/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { IConfig, PROCESSOR_TYPE, WorkflowConfig } from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';

interface ProcessorsListProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * Input component for configuring ingest pipeline processors
 */
export function ProcessorsList(props: ProcessorsListProps) {
  return (
    <EuiFlexGroup direction="column">
      {props.uiConfig?.ingest.enrich.processors.map(
        (processor: IConfig, processorIndex) => {
          return (
            <EuiFlexItem key={processorIndex}>
              <EuiText>
                {processor.metadata?.label || 'Ingest processor'}
              </EuiText>
              <ConfigFieldList
                config={processor}
                baseConfigPath="ingest.enrich"
                onFormChange={props.onFormChange}
              />
            </EuiFlexItem>
          );
        }
      )}
      <EuiFlexItem>
        <EuiButton
          onClick={() => {
            // 1. generate a new ui config with the added processor
            // 2. hook back to base file with the updated ui config
            // 3. base file updates the form values / form schema based on the updated config
            // 4. new page is rendered with the updated list of final processors
            let newConfig = cloneDeep(props.uiConfig as WorkflowConfig);
            newConfig.ingest.enrich.processors = [
              ...newConfig.ingest.enrich.processors,
              {
                type: PROCESSOR_TYPE.MODEL,
                id: 'test-id',
                fields: [],
              },
            ];
            props.setUiConfig(newConfig);
          }}
        >
          Add new processor
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
