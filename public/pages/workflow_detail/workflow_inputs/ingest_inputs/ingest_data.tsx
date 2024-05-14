/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiRadioGroup,
  EuiTitle,
} from '@elastic/eui';
import { IConfigField, Workflow } from '../../../../../common';
import { SelectField, TextField } from '../input_fields';

interface IngestDataProps {
  workflow: Workflow;
  onFormChange: () => void;
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

  useEffect(() => {
    const indexName =
      props.workflow.ui_metadata?.config?.ingest?.index?.name?.value;
    if (indexName) {
      setSelectedOption(OPTION.EXISTING);
    }
  }, [props.workflow.ui_metadata?.config?.ingest?.index]);

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
      <EuiFlexItem>
        {selectedOption === OPTION.NEW ? (
          <TextField
            field={
              props.workflow.ui_metadata?.config?.ingest?.index
                ?.name as IConfigField
            }
            fieldPath={'ingest.index.name'}
            onFormChange={props.onFormChange}
          />
        ) : null}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
