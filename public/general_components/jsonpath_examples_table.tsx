/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isEmpty } from 'lodash';
import {
  EuiInMemoryTable,
  EuiCode,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

interface JsonPathExamplesTableProps {
  headerText?: string;
}

type JSONPathExample = {
  expression: string;
  meaning: string;
  example: string;
};

const examples = [
  {
    expression: '$.data',
    meaning: 'The entire input',
    example: '$.data',
  },
] as JSONPathExample[];

const columns = [
  {
    field: 'expression',
    name: 'Expression',
    width: '25%',
    sortable: false,
    render: (expression: string) => <EuiCode>{expression}</EuiCode>,
  },
  {
    field: 'meaning',
    name: 'Meaning',
    width: '50%',
    sortable: false,
    render: (meaning: string) => <EuiText size="s">{meaning}</EuiText>,
  },
  {
    field: 'example',
    name: 'Example',
    width: '25%',
    sortable: false,
    render: (example: string) => <EuiCode>{example}</EuiCode>,
  },
];

/**
 * A stateless component containing JSONPath examples in a table. Optionally takes in
 * a header text for some more contextual information.
 */
export function JsonPathExamplesTable(props: JsonPathExamplesTableProps) {
  return (
    <EuiFlexItem style={{ width: '20vw' }}>
      <EuiFlexGroup direction="column" gutterSize="xs">
        {!isEmpty(props.headerText) && (
          <EuiFlexItem grow={false}>
            <EuiText size="s">{props.headerText}</EuiText>
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          <EuiInMemoryTable<JSONPathExample>
            items={examples}
            columns={columns}
            pagination={false}
            sorting={false}
            hasActions={false}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
