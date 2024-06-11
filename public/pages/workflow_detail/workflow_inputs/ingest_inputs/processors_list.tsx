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
import { useFormikContext } from 'formik';
import {
  IConfig,
  IProcessorConfig,
  PROCESSOR_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';
import { formikToUiConfig, generateId } from '../../../../utils';

interface ProcessorsListProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * Input component for configuring ingest pipeline processors
 */
export function ProcessorsList(props: ProcessorsListProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  // Adding a processor to the config. Fetch the existing one
  // (getting any updated/interim values along the way) and add to
  // the list of processors
  // TODO: enhance this to either choose from a list of preset
  // processors, or at the least a usable generic processor
  function addProcessor(processorIdToAdd: string): void {
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    newConfig.ingest.enrich.processors = [
      ...newConfig.ingest.enrich.processors,
      {
        type: PROCESSOR_TYPE.ML,
        id: processorIdToAdd,
        fields: [],
      } as IProcessorConfig,
    ];
    props.setUiConfig(newConfig);
  }

  // Deleting a processor from the config. Fetch the existing one
  // (getting any updated/interim values along the way) delete
  // the specified processor from the list of processors
  function deleteProcessor(processorIdToDelete: string): void {
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    newConfig.ingest.enrich.processors = newConfig.ingest.enrich.processors.filter(
      (processorConfig) => processorConfig.id !== processorIdToDelete
    );
    props.setUiConfig(newConfig);
  }

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
                        deleteProcessor(processor.id);
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
              addProcessor(generateId('test-processor'));
            }}
          >
            {props.uiConfig?.ingest.enrich.processors.length > 0
              ? 'Add another processor'
              : 'Add processor'}
          </EuiButton>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
