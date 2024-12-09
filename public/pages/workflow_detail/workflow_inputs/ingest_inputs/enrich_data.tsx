/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsList } from '../processors_list';
import {
  PROCESSOR_CONTEXT,
  PROCESSOR_TYPE,
  WorkflowConfig,
} from '../../../../../common';
import { ProcessorsTitle } from '../../../../general_components';
import { useState, useEffect } from 'react';

interface EnrichDataProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  beforeVersion217: boolean;
}

/**
 * Base component for configuring any data enrichment
 */
export function EnrichData(props: EnrichDataProps) {
  const { uiConfig, setUiConfig } = props;
  const beforeVersion217 = true;
  const initialProcessorCount = uiConfig.ingest.enrich.processors?.filter(
    (processor) => processor.type !== PROCESSOR_TYPE.ML
  ).length;
  const [processorCount, setProcessorCount] = useState<number>(
    initialProcessorCount
  );

  useEffect(() => {
    var processors = uiConfig.ingest.enrich.processors;
    if (beforeVersion217) {
      processors = uiConfig.ingest.enrich.processors.filter(
        (processor) => processor.type !== PROCESSOR_TYPE.ML
      );
    }
    setProcessorCount(processors.length);

    setUiConfig({
      ...uiConfig,
      ingest: {
        ...uiConfig.ingest,
        enrich: {
          ...uiConfig.ingest.enrich,
          processors: processors,
        },
      },
    });
  }, [beforeVersion217]);

  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle title="Enrich data" processorCount={processorCount} />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.INGEST}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
