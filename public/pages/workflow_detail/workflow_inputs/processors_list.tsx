/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import semver from 'semver';
import { getEffectiveVersion } from '../../../pages/workflows/new_workflow/new_workflow';
import {
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiContextMenu,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPopover,
  EuiAccordion,
  EuiSpacer,
} from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { useFormikContext } from 'formik';
import {
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  PROCESSOR_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { formikToUiConfig } from '../../../utils';
import {
  CollapseProcessor,
  MLIngestProcessor,
  MLSearchRequestProcessor,
  MLSearchResponseProcessor,
  NormalizationProcessor,
  RerankProcessor,
  SortIngestProcessor,
  SortSearchResponseProcessor,
  SplitIngestProcessor,
  SplitSearchResponseProcessor,
  TextChunkingIngestProcessor,
} from '../../../configs';
import { ProcessorInputs } from './processor_inputs';
import { SavedObject } from '../../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';

interface ProcessorsListProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  context: PROCESSOR_CONTEXT;
  dataSource?: SavedObject<DataSourceAttributes>;
  onProcessorsChange?: (count: number) => void;
}

const PANEL_ID = 0;

/**
 * General component for configuring pipeline processors (ingest / search request / search response)
 */
export function ProcessorsList(props: ProcessorsListProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  // Processor added state. Used to automatically open accordion when a new
  // processor is added, assuming users want to immediately configure it.
  const [processorAdded, setProcessorAdded] = useState<boolean>(false);

  const [isPopoverOpen, setPopover] = useState(false);
  const closePopover = () => {
    setPopover(false);
  };

  const [processors, setProcessors] = useState<IProcessorConfig[]>([]);

  useEffect(() => {
    const loadProcessors = async () => {
      if (props.uiConfig && props.context) {
        let currentProcessors =
          props.context === PROCESSOR_CONTEXT.INGEST
            ? props.uiConfig.ingest.enrich.processors
            : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? props.uiConfig.search.enrichRequest.processors
            : props.uiConfig.search.enrichResponse.processors;

        if (currentProcessors && props.dataSource?.id) {
          const version = await getEffectiveVersion(props.dataSource.id);

          if (semver.eq(version, '2.17.0')) {
            currentProcessors = currentProcessors.filter(
              (processor) =>
                !processor.name.toLowerCase().includes('ml inference')
            );
          } else if (semver.gte(version, '2.19.0')) {
            currentProcessors = currentProcessors.filter(
              (processor) =>
                ![
                  PROCESSOR_TYPE.TEXT_EMBEDDING,
                  PROCESSOR_TYPE.TEXT_IMAGE_EMBEDDING,
                  PROCESSOR_TYPE.NORMALIZATION,
                ].includes(processor.type)
            );
          }
        }

        setProcessors(currentProcessors);
        if (props.onProcessorsChange) {
          props.onProcessorsChange(currentProcessors?.length || 0);
        }
      }
    };

    loadProcessors();
  }, [props.context, props.uiConfig, props.dataSource]);

  // Adding a processor to the config. Fetch the existing one
  // (getting any updated/interim values along the way) and add to
  // the list of processors
  function addProcessor(processor: IProcessorConfig): void {
    setProcessorAdded(true);
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
  }

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      {processors.map((processor: IProcessorConfig, processorIndex) => {
        return (
          <EuiFlexItem key={processorIndex}>
            <EuiPanel paddingSize="s">
              <EuiAccordion
                initialIsOpen={
                  processorAdded && processorIndex === processors.length - 1
                }
                id={`accordion${processor.id}`}
                buttonContent={`${processor.name || 'Processor'}`}
                extraAction={
                  <EuiSmallButtonIcon
                    iconType={'trash'}
                    color="danger"
                    aria-label="Delete"
                    onClick={() => {
                      deleteProcessor(processor.id);
                    }}
                  />
                }
              >
                <EuiSpacer size="s" />
                <EuiFlexItem style={{ paddingLeft: '28px' }}>
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
                    context={props.context}
                  />
                </EuiFlexItem>
              </EuiAccordion>
            </EuiPanel>
          </EuiFlexItem>
        );
      })}
      <EuiSpacer size="s" />
      <EuiFlexItem>
        <EuiPanel paddingSize="s" grow={true}>
          <EuiFlexGroup
            gutterSize="none"
            alignItems="center"
            justifyContent="center"
          >
            <EuiFlexItem grow={false}>
              <EuiPopover
                button={
                  <EuiSmallButtonEmpty
                    iconType="plusInCircle"
                    iconSide="left"
                    onClick={() => {
                      setPopover(!isPopoverOpen);
                    }}
                    data-testid="addProcessorButton"
                  >
                    {`Add processor`}
                  </EuiSmallButtonEmpty>
                }
                isOpen={isPopoverOpen}
                closePopover={closePopover}
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <EuiContextMenu
                  size="s"
                  initialPanelId={PANEL_ID}
                  panels={[
                    {
                      id: PANEL_ID,
                      title: 'PROCESSORS',
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
                                  addProcessor(
                                    new SplitIngestProcessor().toObj()
                                  );
                                },
                              },
                              {
                                name: 'Sort Processor',
                                onClick: () => {
                                  closePopover();
                                  addProcessor(
                                    new SortIngestProcessor().toObj()
                                  );
                                },
                              },
                              {
                                name: 'Text Chunking Processor',
                                onClick: () => {
                                  closePopover();
                                  addProcessor(
                                    new TextChunkingIngestProcessor().toObj()
                                  );
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
                                name: 'Rerank Processor',
                                onClick: () => {
                                  closePopover();
                                  addProcessor(new RerankProcessor().toObj());
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
                              {
                                name: 'Normalization Processor',
                                onClick: () => {
                                  closePopover();
                                  addProcessor(
                                    new NormalizationProcessor().toObj()
                                  );
                                },
                              },
                              {
                                name: 'Collapse Processor',
                                onClick: () => {
                                  closePopover();
                                  addProcessor(new CollapseProcessor().toObj());
                                },
                              },
                            ],
                    },
                  ]}
                />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
