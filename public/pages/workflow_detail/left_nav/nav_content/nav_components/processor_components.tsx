/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import semver from 'semver';
import {
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiContextMenu,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiIcon,
  EuiCard,
  EuiTitle,
} from '@elastic/eui';
import { cloneDeep, isEmpty } from 'lodash';
import { getIn, useFormikContext } from 'formik';
import {
  CachedFormikState,
  COMPONENT_ID,
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../../common';
import {
  formikToUiConfig,
  getDataSourceFromURL,
  getDataSourceVersion,
} from '../../../../../utils';
import {
  CollapseProcessor,
  CopyIngestProcessor,
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
  TextEmbeddingIngestProcessor,
  TextImageEmbeddingIngestProcessor,
} from '../../../../../configs';
// import { ProcessorInputs } from '../../../processor_inputs';
import { useLocation } from 'react-router-dom';
import { getDataSourceEnabled } from '../../../../../../public/services';
import {
  MIN_SUPPORTED_VERSION,
  MINIMUM_FULL_SUPPORTED_VERSION,
} from '../../../../../../common';
import {
  AppState,
  setIngestPipelineErrors,
  setSearchPipelineErrors,
  useAppDispatch,
} from '../../../../../store';

interface ProcessorComponentsProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  context: PROCESSOR_CONTEXT;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

const PANEL_ID = 0;

/**
 * General component for configuring pipeline processors (ingest / search request / search response)
 */
export function ProcessorComponents(props: ProcessorComponentsProps) {
  const dispatch = useAppDispatch();
  const {
    ingestPipeline: ingestPipelineErrors,
    searchPipeline: searchPipelineErrors,
  } = useSelector((state: AppState) => state.errors);
  const { values, errors, touched } = useFormikContext<WorkflowFormValues>();
  const [version, setVersion] = useState<string>('');
  const location = useLocation();
  const [processorAdded, setProcessorAdded] = useState<boolean>(false);
  const [isPopoverOpen, setPopover] = useState(false);
  const [processors, setProcessors] = useState<IProcessorConfig[]>([]);

  function clearProcessorErrors(): void {
    if (props.context === PROCESSOR_CONTEXT.INGEST) {
      dispatch(setIngestPipelineErrors({ errors: {} }));
    } else {
      dispatch(setSearchPipelineErrors({ errors: {} }));
    }
  }

  const closePopover = () => {
    setPopover(false);
  };

  const handlePopoverClick = () => {
    setPopover(!isPopoverOpen);
  };

  useEffect(() => {
    const dataSourceId = getDataSourceFromURL(location).dataSourceId;

    const enabled = getDataSourceEnabled().enabled;
    if (!enabled) {
      setVersion(MINIMUM_FULL_SUPPORTED_VERSION);
      return;
    }

    if (dataSourceId !== undefined) {
      getDataSourceVersion(dataSourceId)
        .then((ver) => {
          setVersion(ver || MIN_SUPPORTED_VERSION);
        })
        .catch(console.error);
    }
  }, [location]);

  useEffect(() => {
    const loadProcessors = async () => {
      if (props.uiConfig && props.context) {
        let currentProcessors =
          props.context === PROCESSOR_CONTEXT.INGEST
            ? props.uiConfig.ingest.enrich.processors
            : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? props.uiConfig.search.enrichRequest.processors
            : props.uiConfig.search.enrichResponse.processors;

        setProcessors(currentProcessors || []);
      }
    };

    loadProcessors();
  }, [props.context, props.uiConfig]);

  const getMenuItems = () => {
    const isPreV219 =
      semver.gte(version, MIN_SUPPORTED_VERSION) &&
      semver.lt(version, MINIMUM_FULL_SUPPORTED_VERSION);

    const ingestProcessors = [
      ...(isPreV219
        ? [
            {
              name: 'Text Embedding Processor',
              onClick: () => {
                closePopover();
                const newProcessor = new TextEmbeddingIngestProcessor().toObj();
                addProcessor(newProcessor);
                props.setSelectedComponentId(
                  `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
                );
              },
            },
            {
              name: 'Text Image Embedding Processor',
              onClick: () => {
                closePopover();
                const newProcessor = new TextImageEmbeddingIngestProcessor().toObj();
                addProcessor(newProcessor);
                props.setSelectedComponentId(
                  `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
                );
              },
            },
          ]
        : [
            {
              name: 'ML Inference Processor',
              onClick: () => {
                closePopover();
                const newProcessor = new MLIngestProcessor().toObj();
                addProcessor(newProcessor);
                props.setSelectedComponentId(
                  `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
                );
              },
            },
          ]),
      {
        name: 'Split Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new SplitIngestProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Sort Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new SortIngestProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Text Chunking Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new TextChunkingIngestProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Copy Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new CopyIngestProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_DATA}.${newProcessor.id}`
          );
        },
      },
    ];

    const searchRequestProcessors = [
      ...(!isPreV219
        ? [
            {
              name: 'ML Inference Processor',
              onClick: () => {
                closePopover();
                const newProcessor = new MLSearchRequestProcessor().toObj();
                addProcessor(newProcessor);
                props.setSelectedComponentId(
                  `${COMPONENT_ID.ENRICH_SEARCH_REQUEST}.${newProcessor.id}`
                );
              },
            },
          ]
        : []),
    ];

    const searchResponseProcessors = [
      ...(!isPreV219
        ? [
            {
              name: 'ML Inference Processor',
              onClick: () => {
                closePopover();
                const newProcessor = new MLSearchResponseProcessor().toObj();
                addProcessor(newProcessor);
                props.setSelectedComponentId(
                  `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
                );
              },
            },
          ]
        : []),
      {
        name: 'Rerank Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new RerankProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Split Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new SplitSearchResponseProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Sort Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new SortSearchResponseProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Normalization Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new NormalizationProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
          );
        },
      },
      {
        name: 'Collapse Processor',
        onClick: () => {
          closePopover();
          const newProcessor = new CollapseProcessor().toObj();
          addProcessor(newProcessor);
          props.setSelectedComponentId(
            `${COMPONENT_ID.ENRICH_SEARCH_RESPONSE}.${newProcessor.id}`
          );
        },
      },
    ];

    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST:
        return ingestProcessors;
      case PROCESSOR_CONTEXT.SEARCH_REQUEST:
        return searchRequestProcessors;
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE:
        return searchResponseProcessors;
      default:
        return [];
    }
  };

  // Adding a processor to the config. Fetch the existing one
  // (getting any updated/interim values along the way) and add to
  // the list of processors. Additionally, persist any current form state
  // (touched, errors) so they are re-initialized when the form is reset.
  function addProcessor(processor: IProcessorConfig): void {
    clearProcessorErrors();
    props.setCachedFormikState({
      errors,
      touched,
    });
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
    clearProcessorErrors();
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

  function moveProcessorUp(processorIndex: number): void {
    clearProcessorErrors();
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);
    let currentProcessors: IProcessorConfig[] = [];
    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST:
        currentProcessors = newConfig.ingest.enrich.processors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_REQUEST:
        currentProcessors = newConfig.search.enrichRequest.processors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE:
        currentProcessors = newConfig.search.enrichResponse.processors;
        break;
    }

    [
      currentProcessors[processorIndex],
      currentProcessors[processorIndex - 1],
    ] = [
      currentProcessors[processorIndex - 1],
      currentProcessors[processorIndex],
    ];

    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST:
        newConfig.ingest.enrich.processors = currentProcessors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_REQUEST:
        newConfig.search.enrichRequest.processors = currentProcessors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE:
        newConfig.search.enrichResponse.processors = currentProcessors;
        break;
    }

    props.setUiConfig(newConfig);
  }

  function moveProcessorDown(processorIndex: number): void {
    clearProcessorErrors();
    const existingConfig = cloneDeep(props.uiConfig as WorkflowConfig);
    let newConfig = formikToUiConfig(values, existingConfig);

    let currentProcessors: IProcessorConfig[] = [];
    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST:
        currentProcessors = newConfig.ingest.enrich.processors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_REQUEST:
        currentProcessors = newConfig.search.enrichRequest.processors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE:
        currentProcessors = newConfig.search.enrichResponse.processors;
        break;
    }

    [
      currentProcessors[processorIndex],
      currentProcessors[processorIndex + 1],
    ] = [
      currentProcessors[processorIndex + 1],
      currentProcessors[processorIndex],
    ];

    switch (props.context) {
      case PROCESSOR_CONTEXT.INGEST:
        newConfig.ingest.enrich.processors = currentProcessors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_REQUEST:
        newConfig.search.enrichRequest.processors = currentProcessors;
        break;
      case PROCESSOR_CONTEXT.SEARCH_RESPONSE:
        newConfig.search.enrichResponse.processors = currentProcessors;
        break;
    }

    props.setUiConfig(newConfig);
  }

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      {processors.map((processor: IProcessorConfig, processorIndex) => {
        const baseConfigPath =
          props.context === PROCESSOR_CONTEXT.INGEST
            ? 'ingest.enrich'
            : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? 'search.enrichRequest'
            : 'search.enrichResponse';
        const processorPath = `${baseConfigPath}.${processor.id}`;
        const hasErrors = !isEmpty(getIn(errors, processorPath));
        let allTouched = false;
        try {
          if (touched !== undefined && values !== undefined) {
            allTouched =
              Object.keys(getIn(touched, processorPath)).length ===
              Object.keys(getIn(values, processorPath)).length;
          }
        } catch (e) {}

        const processorFormError =
          hasErrors && allTouched
            ? 'Invalid or missing fields detected'
            : undefined;
        const processorRuntimeError =
          props.context === PROCESSOR_CONTEXT.INGEST
            ? getIn(
                ingestPipelineErrors,
                `${processorIndex}.errorMsg`,
                undefined
              )
            : getIn(
                searchPipelineErrors,
                `${processorIndex}.errorMsg`,
                undefined
              );
        const errorFound =
          processorFormError !== undefined ||
          processorRuntimeError !== undefined;
        const errorMsg = processorFormError
          ? 'Form error(s) detected'
          : 'Runtime error(s) detected';

        return (
          <>
            <EuiSpacer size="s" />
            <EuiCard
              //style={{ marginLeft: '4px'}}
              key={processorIndex}
              description={''}
              textAlign="left"
              onClick={() => {
                props.setSelectedComponentId(processorPath);
              }}
              title={
                <EuiFlexGroup
                  direction="row"
                  gutterSize="s"
                  justifyContent="spaceAround"
                >
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup direction="column" gutterSize="none">
                      <EuiFlexItem grow={false}>
                        <EuiTitle size="xs">
                          <h2>{processor.name}</h2>
                        </EuiTitle>
                      </EuiFlexItem>
                      {errorFound && (
                        <EuiFlexItem grow={false}>
                          <EuiFlexGroup
                            direction="row"
                            gutterSize="s"
                            alignItems="flexStart"
                          >
                            <EuiFlexItem grow={false}>
                              <EuiIcon
                                color="danger"
                                type={'alert'}
                                style={{ marginTop: '4px' }}
                              />
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                              <EuiText
                                size="s"
                                color="danger"
                                style={{
                                  marginTop: '0px',
                                }}
                              >
                                {errorMsg}
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      )}
                    </EuiFlexGroup>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup
                      gutterSize="s"
                      alignItems="center"
                      direction="row"
                    >
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonIcon
                          iconType="sortUp"
                          aria-label="Move processor up"
                          onClick={() => moveProcessorUp(processorIndex)}
                          isDisabled={processorIndex === 0}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonIcon
                          iconType="sortDown"
                          aria-label="Move processor down"
                          onClick={() => moveProcessorDown(processorIndex)}
                          isDisabled={processorIndex === processors.length - 1}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiSmallButtonIcon
                          iconType="trash"
                          color="danger"
                          aria-label="Delete"
                          onClick={() => {
                            deleteProcessor(processor.id);
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              }
            >
              {/* <EuiFlexItem style={{ paddingLeft: '28px' }}>
                  {errorFound && processorOpen && (
                    <>
                      <EuiCallOut
                        size="s"
                        color="danger"
                        iconType={'alert'}
                        title={errorMsg}
                      >
                        <EuiText size="s">
                          {processorFormError || processorRuntimeError}
                        </EuiText>
                      </EuiCallOut>
                      <EuiSpacer size="s" />
                    </>
                  )} 
                  
                    <ProcessorInputs
                    uiConfig={props.uiConfig}
                    config={processor}
                    baseConfigPath={baseConfigPath}
                    context={props.context}
                  />
                  
                  <EuiText>Processor input</EuiText>
                </EuiFlexItem>
                */}
            </EuiCard>
          </>
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
                    onClick={handlePopoverClick}
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
                {version && (
                  <EuiContextMenu
                    size="s"
                    initialPanelId={PANEL_ID}
                    panels={[
                      {
                        id: PANEL_ID,
                        title: getMenuItems().length > 0 ? 'PROCESSORS' : '',
                        items: (() => {
                          const items = getMenuItems();
                          return items;
                        })(),
                      },
                    ]}
                  />
                )}
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
