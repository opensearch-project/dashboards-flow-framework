/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiButtonIcon,
  EuiCallOut,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSmallButtonEmpty,
  EuiTitle,
} from '@elastic/eui';
import { SourceData, IngestData } from './ingest_inputs';
import { ConfigureSearchRequest, RunQuery } from './search_inputs';
import {
  COMPONENT_ID,
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { ProcessorInputs } from './processor_inputs';
import { AppState } from '../../../store';

// styling
import '../workspace/workspace-styles.scss';

interface ComponentInputProps {
  selectedComponentId: string;
  setIngestDocs: (docs: string) => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  workflow: Workflow | undefined;
  lastIngested: number | undefined;
  ingestUpdateRequired: boolean;
  readonly: boolean;
  leftNavOpen: boolean; // optionally show a button to expand out the left nav, if it is collapsed
  openLeftNav: () => void;
  displaySearchPanel: () => void;
}

/**
 * The base component for dynamic rendering of selected components from the left nav. This is the
 * main form component users will be viewing component details and making changes.
 */
export function ComponentInput(props: ComponentInputProps) {
  const {
    ingestPipeline: ingestPipelineErrors,
    searchPipeline: searchPipelineErrors,
  } = useSelector((state: AppState) => state.errors);

  const { values } = useFormikContext<WorkflowFormValues>();

  // top-level edit button state. Currently implemented as a modal, and only applicable for (and only integrated with)
  // the "Source Data" component. In the future, the edit content may be moved into a contextual panel,
  // and there may be more top-level actions, such as "preview transformations" for individual processors.
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // processor-related state. If a processor component is selected, do some extra parsing
  // to gather the extra data (processor config, context, error(s))
  const [processors, setProcessors] = useState<IProcessorConfig[] | undefined>(
    undefined
  );
  const [processor, setProcessor] = useState<IProcessorConfig | undefined>(
    undefined
  );
  const [processorContext, setProcessorContext] = useState<
    PROCESSOR_CONTEXT | undefined
  >(undefined);
  const [processorError, setProcessorError] = useState<string | undefined>(
    undefined
  );

  // fetch processor state when the source component ID is updated
  useEffect(() => {
    if (isProcessorComponent(props.selectedComponentId)) {
      const context = getContextFromComponentId(props.selectedComponentId);
      const processors = getProcessorsFromContext(props.uiConfig, context);
      const processorId = getProcessorId(props.selectedComponentId);
      setProcessors(processors);
      setProcessor(
        processors.find((processor) => processor.id === processorId)
      );
      setProcessorContext(context);
    } else {
      setProcessor(undefined);
      setProcessorContext(undefined);
      setProcessorError(undefined);
    }
  }, [props.uiConfig, props.selectedComponentId]);

  // fetch any runtime errors when a processor is selected, and/or if
  // there are updates to the global ingest/search pipeline errors
  useEffect(() => {
    if (
      processors !== undefined &&
      processor !== undefined &&
      processorContext !== undefined
    ) {
      let processorIndex = undefined as number | undefined;
      processors.find((processorInList, idx) => {
        if (processorInList.id === processor.id) {
          processorIndex = idx;
          return true;
        } else {
          return false;
        }
      });
      if (processorIndex !== undefined) {
        const processorRuntimeError =
          processorContext === PROCESSOR_CONTEXT.INGEST
            ? (getIn(
                ingestPipelineErrors,
                `${processorIndex}.errorMsg`,
                undefined
              ) as string | undefined)
            : (getIn(
                searchPipelineErrors,
                `${
                  processorContext === PROCESSOR_CONTEXT.SEARCH_REQUEST
                    ? processorIndex
                    : // manually add any search request processors to get to the correct index of
                      // the search response processor
                      (props.uiConfig?.search?.enrichRequest?.processors
                        ?.length || 0) + processorIndex
                }.errorMsg`,
                undefined
              ) as string | undefined);
        setProcessorError(processorRuntimeError);
      } else {
        setProcessorError(undefined);
      }
    }
  }, [ingestPipelineErrors, searchPipelineErrors, processor]);

  function getComponentButton() {
    return !props.leftNavOpen ? (
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          style={{ marginTop: '4px', marginRight: '8px' }}
          data-testid="showLeftNavButton"
          aria-label="showLeftNavButton"
          iconType={'menuRight'}
          size="xs"
          display="base"
          onClick={() => {
            props.openLeftNav();
          }}
        />
      </EuiFlexItem>
    ) : undefined;
  }

  function getComponentIcon() {
    let iconType = undefined as string | undefined;
    switch (props.selectedComponentId) {
      case COMPONENT_ID.SOURCE_DATA: {
        iconType = 'document';
        break;
      }
      case COMPONENT_ID.INGEST_DATA: {
        iconType = 'indexSettings';
        break;
      }
      case COMPONENT_ID.SEARCH_REQUEST: {
        iconType = 'editorCodeBlock';
        break;
      }
      case COMPONENT_ID.RUN_QUERY:
      case COMPONENT_ID.SEARCH_RESULTS: {
        iconType = 'list';
        break;
      }
    }
    return iconType !== undefined ? (
      <EuiFlexItem grow={false} style={{ paddingTop: '8px' }}>
        <EuiIcon type={iconType} size="m" />
      </EuiFlexItem>
    ) : undefined;
  }

  function getComponentTitle() {
    let componentTitle = undefined as string | undefined;
    let showEditButton = false;
    if (props.selectedComponentId === COMPONENT_ID.SOURCE_DATA) {
      componentTitle = 'Sample data';
      if (!isEmpty(values?.ingest?.docs)) {
        showEditButton = true;
      }
    } else if (
      isProcessorComponent(props.selectedComponentId) &&
      processor !== undefined
    ) {
      componentTitle = processor.name;
    } else if (props.selectedComponentId === COMPONENT_ID.INGEST_DATA) {
      componentTitle = 'Index';
    } else if (props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST) {
      componentTitle = 'Sample query';
    } else if (props.selectedComponentId === COMPONENT_ID.RUN_QUERY) {
      componentTitle = 'Run query';
    } else if (props.selectedComponentId === COMPONENT_ID.SEARCH_RESULTS) {
      componentTitle = 'Search results';
    }
    return componentTitle !== undefined ? (
      <EuiFlexItem>
        <EuiFlexGroup direction="row" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{componentTitle}</h3>
            </EuiTitle>
          </EuiFlexItem>
          {showEditButton && (
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty
                iconSide="left"
                iconType={'pencil'}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </EuiSmallButtonEmpty>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    ) : undefined;
  }

  return (
    <EuiPanel
      data-testid="componentInputPanel"
      paddingSize="s"
      grow={true}
      className="workspace-panel"
      borderRadius="l"
      style={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll',
      }}
    >
      {props.uiConfig === undefined ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        <>
          <EuiFlexGroup direction="row" gutterSize="s">
            {getComponentButton()}
            {getComponentIcon()}
            {getComponentTitle()}
          </EuiFlexGroup>
          {!isEmpty(props.selectedComponentId) && (
            <EuiHorizontalRule margin="s" style={{ marginTop: '6px' }} />
          )}
          {/**
           * Extra paddding added to the parent EuiFlexItem to account for overflow
           * within the resizable panel, which has truncation issues otherwise.
           */}
          <EuiFlexItem style={{ paddingBottom: '60px' }}>
            {props.selectedComponentId === COMPONENT_ID.SOURCE_DATA ? (
              <SourceData
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                setIngestDocs={props.setIngestDocs}
                lastIngested={props.lastIngested}
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                ingestUpdateRequired={props.ingestUpdateRequired}
                disabled={props.readonly}
              />
            ) : isProcessorComponent(props.selectedComponentId) &&
              processor !== undefined &&
              processorContext !== undefined ? (
              <EuiFlexGroup direction="column" gutterSize="m">
                {processorError !== undefined && (
                  <EuiFlexItem grow={false}>
                    <EuiCallOut
                      color="danger"
                      iconType="alert"
                      title={'Runtime error detected'}
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {processorError}
                    </EuiCallOut>
                  </EuiFlexItem>
                )}
                <EuiFlexItem grow={false}>
                  <ProcessorInputs
                    uiConfig={props.uiConfig}
                    config={processor}
                    baseConfigPath={
                      processorContext === PROCESSOR_CONTEXT.INGEST
                        ? 'ingest.enrich'
                        : processorContext === PROCESSOR_CONTEXT.SEARCH_REQUEST
                        ? 'search.enrichRequest'
                        : 'search.enrichResponse'
                    }
                    context={processorContext}
                    disabled={props.readonly}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : props.selectedComponentId === COMPONENT_ID.INGEST_DATA ? (
              <IngestData disabled={props.readonly} />
            ) : props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST ? (
              <ConfigureSearchRequest disabled={props.readonly} />
            ) : props.selectedComponentId === COMPONENT_ID.RUN_QUERY ? (
              <RunQuery
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                displaySearchPanel={props.displaySearchPanel}
              />
            ) : props.selectedComponentId === COMPONENT_ID.SEARCH_RESULTS ? (
              <RunQuery
                workflow={props.workflow}
                uiConfig={props.uiConfig}
                displaySearchPanel={props.displaySearchPanel}
                includeSearchResultTransforms={true}
              />
            ) : (
              <EuiEmptyPrompt
                title={
                  <h2>
                    Select a component from the ingest or search flow to view
                    details.
                  </h2>
                }
                titleSize="s"
              />
            )}
          </EuiFlexItem>
        </>
      )}
    </EuiPanel>
  );
}

function isProcessorComponent(componentId: string): boolean {
  return (
    componentId.startsWith('ingest.enrich') ||
    componentId.startsWith('search.enrichRequest') ||
    componentId.startsWith('search.enrichResponse')
  );
}

function getContextFromComponentId(componentId: string): PROCESSOR_CONTEXT {
  return componentId.startsWith('ingest.enrich')
    ? PROCESSOR_CONTEXT.INGEST
    : componentId.startsWith('search.enrichRequest')
    ? PROCESSOR_CONTEXT.SEARCH_REQUEST
    : PROCESSOR_CONTEXT.SEARCH_RESPONSE;
}

function getProcessorsFromContext(
  uiConfig: WorkflowConfig,
  context: PROCESSOR_CONTEXT
): IProcessorConfig[] {
  return context === PROCESSOR_CONTEXT.INGEST
    ? uiConfig.ingest.enrich.processors
    : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
    ? uiConfig.search.enrichRequest.processors
    : uiConfig.search.enrichResponse.processors;
}

// remove the contextual prefix, e.g., 'ingest.enrich'
function getProcessorId(componentId: string): string {
  const ingestPrefix = 'ingest.enrich.';
  const searchReqPrefix = 'search.enrichRequest.';
  const searchRespPrefix = 'search.enrichResponse.';
  return componentId.startsWith(ingestPrefix)
    ? componentId.slice(ingestPrefix.length)
    : componentId.startsWith(searchReqPrefix)
    ? componentId.slice(searchReqPrefix.length)
    : componentId.slice(searchRespPrefix.length);
}
