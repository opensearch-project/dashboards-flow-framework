/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsList } from '../processors_list';
import { PROCESSOR_CONTEXT, WorkflowConfig } from '../../../../../common';
import { ProcessorsTitle } from '../../../../general_components';
import { SavedObject } from '../../../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../../../src/plugins/data_source/common/data_sources';

interface EnrichDataProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  dataSource?: SavedObject<DataSourceAttributes>;
}

/**
 * Base component for configuring any data enrichment
 */
export function EnrichData(props: EnrichDataProps) {
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Enrich data"
        processorCount={props.uiConfig.ingest.enrich.processors?.length || 0}
        optional={true}
      />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.INGEST}
          dataSource={props.dataSource}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
