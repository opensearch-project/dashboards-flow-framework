/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFlexItem, EuiPanel } from '@elastic/eui';
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

// styling
import '../../workspace/workspace-styles.scss';

interface ComponentInputProps {
  selectedComponentId: string;
  setIngestDocs: (docs: string) => void;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  workflow: Workflow | undefined;
  lastIngested: number | undefined;
}

/**
 * The base component for dynamic rendering of selected components from the left nav. This is the
 * main form component users will be viewing component details and making changes.
 */
export function ComponentInput(props: ComponentInputProps) {
  // processor-related state. If a processor component is selected, do some extra parsing
  // to gather the extra data (processor config, context)
  const [processor, setProcessor] = useState<IProcessorConfig | undefined>(
    undefined
  );
  const [processorContext, setProcessorContext] = useState<
    PROCESSOR_CONTEXT | undefined
  >(undefined);

  useEffect(() => {
    if (isProcessorComponent(props.selectedComponentId)) {
      const context = getContextFromComponentId(props.selectedComponentId);
      const processors = getProcessorsFromContext(props.uiConfig, context);
      const processorId = getProcessorId(props.selectedComponentId);

      setProcessor(
        processors.find((processor) => processor.id === processorId)
      );
      setProcessorContext(context);
    } else {
      setProcessor(undefined);
      setProcessorContext(undefined);
    }
  }, [props.uiConfig, props.selectedComponentId]);

  return (
    <EuiPanel
      paddingSize="s"
      grow={true}
      className="workspace-panel"
      borderRadius="l"
    >
      <EuiFlexItem>
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
          />
        ) : props.selectedComponentId === COMPONENT_ID.INGEST_DATA ? (
          <IngestData />
        ) : props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST ? (
          <ConfigureSearchRequest />
        ) : undefined}
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
