/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import {
  EuiCallOut,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { SourceData, IngestData } from '../ingest_inputs';
import { ConfigureSearchRequest } from '../search_inputs';
import {
  COMPONENT_ID,
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  Workflow,
  WorkflowConfig,
} from '../../../../../common';
import { ProcessorInputs } from '../processor_inputs';
import { AppState } from '../../../../store';

// styling
import '../../workspace/workspace-styles.scss';

interface ComponentInputProps {
  selectedComponentId: string;
  setIngestDocs: (docs: string) => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  workflow: Workflow | undefined;
  lastIngested: number | undefined;
  // TODO: propagate readonly to block any form updates. Already completed for all processor types.
  readonly: boolean;
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

  return (
    <EuiPanel
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
              <EuiText size="s">
                <h3>{processor.name}</h3>
              </EuiText>
            </EuiFlexItem>
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
          <IngestData />
        ) : props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST ? (
          <ConfigureSearchRequest />
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
