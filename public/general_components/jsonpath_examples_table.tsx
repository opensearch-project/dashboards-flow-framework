/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiInMemoryTable, EuiCode, EuiText } from '@elastic/eui';

interface JsonPathExamplesTableProps {}

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
 * A stateless component containing JSONPath examples in a table.
 */
export function JsonPathExamplesTable(props: JsonPathExamplesTableProps) {
  return (
    <EuiInMemoryTable<JSONPathExample>
      items={examples}
      columns={columns}
      pagination={false}
      sorting={false}
      hasActions={false}
    />
  );
}
