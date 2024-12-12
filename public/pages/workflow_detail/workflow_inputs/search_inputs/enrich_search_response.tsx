/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsTitle } from '../../../../general_components';
import { PROCESSOR_CONTEXT, WorkflowConfig } from '../../../../../common';
import { ProcessorsList } from '../processors_list';
import { SavedObject } from '../../../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../../../src/plugins/data_source/common/data_sources';

interface EnrichSearchResponseProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  dataSource?: SavedObject<DataSourceAttributes>;
}

/**
 * Input component for enriching a search response (configuring search response processors, etc.)
 */
export function EnrichSearchResponse(props: EnrichSearchResponseProps) {
  const [filteredCount, setFilteredCount] = useState(0);

  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Enhance query results"
        processorCount={filteredCount}
      />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
          dataSource={props.dataSource}
          onProcessorsChange={setFilteredCount}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
