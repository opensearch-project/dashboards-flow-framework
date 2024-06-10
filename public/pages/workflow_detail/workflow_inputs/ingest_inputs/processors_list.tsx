/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { IConfig, PROCESSOR_TYPE, WorkflowConfig } from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';
import { generateId } from '../../../../utils';

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
              <EuiPanel>
                <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiText>
                      {processor.metadata?.label || 'Ingest processor'}
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      iconType={'trash'}
                      color="danger"
                      aria-label="Delete"
                      onClick={() => {
                        let newConfig = cloneDeep(
                          props.uiConfig as WorkflowConfig
                        );
                        newConfig.ingest.enrich.processors = newConfig.ingest.enrich.processors.filter(
                          (processorConfig) =>
                            processorConfig.id !== processor.id
                        );
                        props.setUiConfig(newConfig);
                      }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiHorizontalRule size="full" margin="s" />
                <ConfigFieldList
                  config={processor}
                  baseConfigPath="ingest.enrich"
                  onFormChange={props.onFormChange}
                />
              </EuiPanel>
            </EuiFlexItem>
          );
        }
      )}
      <EuiFlexItem grow={false}>
        <div>
          <EuiButton
            onClick={() => {
              let newConfig = cloneDeep(props.uiConfig as WorkflowConfig);
              newConfig.ingest.enrich.processors = [
                ...newConfig.ingest.enrich.processors,
                {
                  type: PROCESSOR_TYPE.MODEL,
                  id: generateId('test-id'),
                  fields: [],
                },
              ];
              props.setUiConfig(newConfig);
            }}
          >
            Add another processor
          </EuiButton>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
