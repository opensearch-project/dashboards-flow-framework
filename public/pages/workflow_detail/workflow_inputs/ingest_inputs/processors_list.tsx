/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiButton,
  EuiButtonIcon,
  EuiContextMenu,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiPopover,
  EuiText,
} from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { useFormikContext } from 'formik';
import {
  IConfig,
  IProcessorConfig,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';
import { formikToUiConfig } from '../../../../utils';
import { MLIngestProcessor } from '../../../../configs';

interface ProcessorsListProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

const PANEL_ID = 0;

/**
 * Input component for configuring ingest pipeline processors
 */
export function ProcessorsList(props: ProcessorsListProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  // Popover state when adding new processors
  const [isPopoverOpen, setPopover] = useState(false);
  const closePopover = () => {
    setPopover(false);
  };

  // Adding a processor to the config. Fetch the existing one
  // (getting any updated/interim values along the way) and add to
  // the list of processors
  // TODO: enhance this to either choose from a list of preset
  // processors, or at the least a usable generic processor
  function addProcessor(processor: IProcessorConfig): void {
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    newConfig.ingest.enrich.processors = [
      ...newConfig.ingest.enrich.processors,
      processor,
    ];
    props.setUiConfig(newConfig);
    props.onFormChange();
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
    props.onFormChange();
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
                    <EuiText>{processor.name || 'Ingest processor'}</EuiText>
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
          <EuiPopover
            button={
              <EuiButton
                iconType="arrowDown"
                iconSide="right"
                onClick={() => {
                  setPopover(!isPopoverOpen);
                }}
              >
                {props.uiConfig?.ingest.enrich.processors.length > 0
                  ? 'Add another processor'
                  : 'Add processor'}
              </EuiButton>
            }
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            panelPaddingSize="none"
            anchorPosition="downLeft"
          >
            <EuiContextMenu
              initialPanelId={PANEL_ID}
              panels={[
                {
                  id: PANEL_ID,
                  title: 'Processors',
                  // TODO: add more processor types
                  items: [
                    {
                      name: 'ML Inference Processor',
                      onClick: () => {
                        closePopover();
                        addProcessor(new MLIngestProcessor().toObj());
                      },
                    },
                  ],
                },
              ]}
            />
          </EuiPopover>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
