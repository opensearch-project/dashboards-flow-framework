/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiRadioGroup,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../../common';

interface IngestDataProps {
  workflow: Workflow;
}

enum OPTION {
  NEW = 'new',
  EXISTING = 'existing',
}

const options = [
  {
    id: OPTION.NEW,
    label: 'Create a new index',
  },
  {
    id: OPTION.EXISTING,
    label: 'Choose existing index',
  },
];

/**
 * Input component for configuring the data ingest (the OpenSearch index)
 */
export function IngestData(props: IngestDataProps) {
  const [selectedOption, setSelectedOption] = useState<OPTION>(OPTION.NEW);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Ingest data</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiRadioGroup
          options={options}
          idSelected={selectedOption}
          onChange={(optionId) => setSelectedOption(optionId as OPTION)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
