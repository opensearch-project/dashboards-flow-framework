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
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';
import { JSONPATH_DOCS_LINK } from '../../common';

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
    expression: '$',
    meaning: 'The root object / element',
    example: '$.my_field',
  },
  {
    expression: '.',
    meaning: 'Child member operator',
    example: 'my_field.my_sub_field',
  },
  {
    expression: '..',
    meaning:
      'Recursive descendant operator, to specify an object field in an array of objects',
    example: '$..my_field',
  },
  {
    expression: '*',
    meaning: 'Wildcard matching all objects',
    example: 'my_array.*',
  },
  {
    expression: '[]',
    meaning: 'Subscript operator',
    example: 'my_array[0]',
  },
  {
    expression: '[,]',
    meaning: 'Union operator for alternate names or array indices as a set',
    example: 'my_array[0,1]',
  },
  {
    expression: '[start:end:step]',
    meaning: 'Array slice operator borrowed from ES4 / Python',
    example: 'my_array[0:5]',
  },
  {
    expression: '@',
    meaning: 'The current object / element in an array',
    example: 'my_array[?(@.price<10)]',
  },
  {
    expression: '()',
    meaning: 'Script expression via static evaluation',
    example: 'my_array[?(@.price<10)]',
  },
  {
    expression: '?()',
    meaning: 'Applies a filter (script) expression via static evaluation',
    example: 'my_array[?(@.price<10)]',
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
    <EuiFlexItem style={{ width: '40vw' }}>
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
        <EuiSpacer size="s" />
        <EuiFlexItem grow={false}>
          <EuiLink href={JSONPATH_DOCS_LINK} target="_blank">
            More examples & documentation
          </EuiLink>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
