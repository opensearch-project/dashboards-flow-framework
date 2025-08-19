/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiFieldSearch,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { SimplifiedJsonField } from './simplified_json_field';
import { customStringify, WorkflowFormValues } from '../../../../common';
import { getIn, useFormikContext } from 'formik';
import { cloneDeep } from 'lodash';

interface SimplifiedSearchQueryProps {}

export function SimplifiedSearchQuery(props: SimplifiedSearchQueryProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [simpleSearchQuery, setSimpleSearchQuery] = useState<string>(
    finalQuery?.query?.agentic?.query_text || ''
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setSimpleSearchQuery(finalQuery?.query?.agentic?.query_text || '');
  }, [finalQuery]);

  const handleModeSwitch = (isAdvanced: boolean) => {
    if (!isAdvanced) {
      try {
        if (finalQuery?.query?.agentic?.query_text) {
          setSimpleSearchQuery(finalQuery.query.agentic.query_text);
        }
      } catch (error) {}
    }
    setAdvancedMode(isAdvanced);
  };

  const handleSimpleQueryChange = (e: any) => {
    const newQueryText = e.target.value;
    setSimpleSearchQuery(newQueryText);

    // Update the finalQuery in the parent by creating a new query with the updated text
    let updatedQuery = cloneDeep(finalQuery);
    if (updatedQuery?.query?.agentic?.query_text !== undefined) {
      updatedQuery.query.agentic.query_text = newQueryText;
      setFieldValue('search.request', customStringify(updatedQuery));
    }
  };

  const handleAdvancedQueryChange = (value: string) => {
    try {
      const parsedQuery = JSON.parse(value);
      setFieldValue('search.request', customStringify(parsedQuery));
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON: ' + (error as Error).message);
    }
  };

  return (
    <>
      <EuiFormRow
        label={
          <>
            Search Query
            <EuiToolTip content="Enter your question or query in natural language. The AI agent will convert it to an optimized search query">
              <EuiIcon
                type="questionInCircle"
                color="subdued"
                style={{ marginLeft: '4px' }}
              />
            </EuiToolTip>
          </>
        }
        fullWidth
      >
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiFlexGroup
              gutterSize="s"
              alignItems="center"
              justifyContent="flexStart"
            >
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  color={!advancedMode ? 'primary' : 'text'}
                  onClick={() => handleModeSwitch(false)}
                  size="xs"
                  iconType="kqlField"
                >
                  Simple
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  color={advancedMode ? 'primary' : 'text'}
                  onClick={() => handleModeSwitch(true)}
                  size="xs"
                  iconType="kqlFunction"
                >
                  Advanced
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            {advancedMode ? (
              <SimplifiedJsonField
                value={customStringify(finalQuery)}
                onChange={handleAdvancedQueryChange}
                editorHeight="200px"
                isInvalid={!!jsonError}
                helpText="Edit the full OpenSearch DSL query with agentic search parameters"
              />
            ) : (
              <EuiFieldSearch
                placeholder="Enter your question or query here..."
                value={simpleSearchQuery}
                onChange={handleSimpleQueryChange}
                fullWidth
                isClearable
                aria-label="Enter search query"
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    </>
  );
}
