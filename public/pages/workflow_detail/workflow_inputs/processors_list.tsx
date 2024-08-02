/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiSmallButton,
  EuiSmallButtonIcon,
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
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { formikToUiConfig } from '../../../utils';
import {
  MLIngestProcessor,
  MLSearchRequestProcessor,
  MLSearchResponseProcessor,
  SortIngestProcessor,
  SortSearchResponseProcessor,
  SplitIngestProcessor,
  SplitSearchResponseProcessor,
} from '../../../configs';
import { ProcessorInputs } from './processor_inputs';

interface ProcessorsListProps {
  onFormChange: () => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  context: PROCESSOR_CONTEXT;
}

const PANEL_ID = 0;

/**
 * General component for configuring pipeline processors (ingest / search request / search response)
 */
export function ProcessorsList(props: ProcessorsListProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  // Popover state when adding new processors
  const [isPopoverOpen, setPopover] = useState(false);
  const closePopover = () => {
    setPopover(false);
  };

  // Current processors state
  const [processors, setProcessors] = useState<IProcessorConfig[]>([]);
  useEffect(() => {
    if (props.uiConfig && props.context) {
      setProcessors(
        props.context === PROCESSOR_CONTEXT.INGEST
          ? props.uiConfig.ingest.enrich.processors
          : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? props.uiConfig.search.enrichRequest.processors
          : props.uiConfig.search.enrichResponse.processors
      );
    }
  }, [props.context, props.uiConfig]);

  // Adding a processor to the config. Fetch the existing one
  // (getting any updated/interim values along the way) and add to
  // the list of processors
  function addProcessor(processor: IProcessorConfig): void {
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST: {
        newConfig.ingest.enrich.processors = [
          ...newConfig.ingest.enrich.processors,
          processor,
        ];
        break;
      }
      case PROCESSOR_CONTEXT.SEARCH_REQUEST: {
        newConfig.search.enrichRequest.processors = [
          ...newConfig.search.enrichRequest.processors,
          processor,
        ];
        break;
      }
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
        newConfig.search.enrichResponse.processors = [
          ...newConfig.search.enrichResponse.processors,
          processor,
        ];
        break;
      }
    }
    props.setUiConfig(newConfig);
    props.onFormChange();
  }

  // Deleting a processor from the config. Fetch the existing one
  // (getting any updated/interim values along the way) delete
  // the specified processor from the list of processors
  function deleteProcessor(processorIdToDelete: string): void {
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST: {
        newConfig.ingest.enrich.processors = newConfig.ingest.enrich.processors.filter(
          (processorConfig) => processorConfig.id !== processorIdToDelete
        );
        break;
      }
      case PROCESSOR_CONTEXT.SEARCH_REQUEST: {
        newConfig.search.enrichRequest.processors = newConfig.search.enrichRequest.processors.filter(
          (processorConfig) => processorConfig.id !== processorIdToDelete
        );
        break;
      }
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
        newConfig.search.enrichResponse.processors = newConfig.search.enrichResponse.processors.filter(
          (processorConfig) => processorConfig.id !== processorIdToDelete
        );
        break;
      }
    }

    props.setUiConfig(newConfig);
    props.onFormChange();
  }

  return (
    <EuiFlexGroup direction="column">
      {processors.map((processor: IProcessorConfig, processorIndex) => {
        return (
          <EuiFlexItem key={processorIndex}>
            <EuiPanel>
              <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiText>{processor.name || 'Processor'}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonIcon
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
              <ProcessorInputs
                uiConfig={props.uiConfig}
                config={processor}
                baseConfigPath={
                  props.context === PROCESSOR_CONTEXT.INGEST
                    ? 'ingest.enrich'
                    : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                    ? 'search.enrichRequest'
                    : 'search.enrichResponse'
                }
                onFormChange={props.onFormChange}
                context={props.context}
              />
            </EuiPanel>
          </EuiFlexItem>
        );
      })}
      <EuiFlexItem grow={false}>
        <div>
          <EuiPopover
            button={
              <EuiSmallButton
                iconType="arrowDown"
                iconSide="right"
                size="s"
                onClick={() => {
                  setPopover(!isPopoverOpen);
                }}
              >
                {processors.length > 0
                  ? 'Add another processor'
                  : 'Add processor'}
              </EuiSmallButton>
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
                  items:
                    props.context === PROCESSOR_CONTEXT.INGEST
                      ? [
                          {
                            name: 'ML Inference Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(new MLIngestProcessor().toObj());
                            },
                          },
                          {
                            name: 'Split Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(new SplitIngestProcessor().toObj());
                            },
                          },
                          {
                            name: 'Sort Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(new SortIngestProcessor().toObj());
                            },
                          },
                        ]
                      : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                      ? [
                          {
                            name: 'ML Inference Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(
                                new MLSearchRequestProcessor().toObj()
                              );
                            },
                          },
                        ]
                      : [
                          {
                            name: 'ML Inference Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(
                                new MLSearchResponseProcessor().toObj()
                              );
                            },
                          },
                          {
                            name: 'Split Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(
                                new SplitSearchResponseProcessor().toObj()
                              );
                            },
                          },
                          {
                            name: 'Sort Processor',
                            onClick: () => {
                              closePopover();
                              addProcessor(
                                new SortSearchResponseProcessor().toObj()
                              );
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
