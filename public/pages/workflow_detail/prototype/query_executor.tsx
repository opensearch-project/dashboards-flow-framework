/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiButton,
  EuiCodeEditor,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import {
  USE_CASE,
  Workflow,
  getIndexName,
  getSemanticSearchValues,
} from '../../../../common';

interface QueryExecutorProps {
  workflow: Workflow;
}

type WorkflowValues = {
  modelId: string;
};

type SemanticSearchValues = WorkflowValues & {
  inputField: string;
  vectorField: string;
};

type QueryGeneratorFn = (
  queryText: string,
  workflowValues: SemanticSearchValues
) => {};

/**
 * A basic and flexible UI for executing queries against an index. Sets up guardrails to limit
 * what is customized in the query, and setting readonly values based on the workflow's use case
 * and details.
 *
 * For example, given a semantic search workflow configured on index A, with model B, input field C, and vector field D,
 * the UI will enforce a semantic search neural query configured with B,C,D, and run it against A.
 */
export function QueryExecutor(props: QueryExecutorProps) {
  // query state
  const [workflowValues, setWorkflowValues] = useState<WorkflowValues>();
  const [queryGeneratorFn, setQueryGeneratorFn] = useState<QueryGeneratorFn>();
  const [indexName, setIndexName] = useState<string>();
  const [queryObj, setQueryObj] = useState<{}>({});
  const [userInput, setUserInput] = useState<string>('');

  // results state
  const [resultsObj, setResultsObj] = useState<{}>({});

  // hook to set all of the workflow-related fields based on the use case
  useEffect(() => {
    setWorkflowValues(getWorkflowValues(props.workflow));
    setQueryGeneratorFn(getQueryGeneratorFn(props.workflow));
    setIndexName(getIndexName(props.workflow));
  }, [props.workflow]);

  // hook to generate the query once all dependent input vars are available
  useEffect(() => {
    if (queryGeneratorFn && workflowValues) {
      setQueryObj(queryGeneratorFn(userInput, workflowValues));
    }
  }, [userInput, queryGeneratorFn, workflowValues]);

  function onExecute() {}

  return (
    <EuiFlexGroup direction="row">
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <EuiText>Query</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row">
              <EuiFlexItem>
                <EuiFieldText
                  placeholder={'Enter some plaintext...'}
                  compressed={false}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                  }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={onExecute} fill={false}>
                  Run!
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCodeEditor
              mode="json"
              theme="textmate"
              width="100%"
              height="50vh"
              value={getFormattedJSONString(queryObj)}
              onChange={() => {}}
              readOnly={true}
              setOptions={{
                fontSize: '14px',
                //   enableBasicAutocompletion: true,
                //   enableLiveAutocompletion: true,
              }}
              aria-label="Code Editor"
              tabSize={2}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}></EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiText>Results</EuiText>
          </EuiFlexItem>
          <EuiFlexItem style={{ marginTop: '70px' }}>
            <EuiCodeEditor
              mode="json"
              theme="textmate"
              width="100%"
              height="50vh"
              value={getFormattedJSONString(resultsObj)}
              onChange={() => {}}
              readOnly={true}
              setOptions={{
                fontSize: '14px',
              }}
              aria-label="Code Editor"
              tabSize={2}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

// utility fn to get the displayable JSON string
function getFormattedJSONString(obj: {}): string {
  return Object.values(obj).length > 0 ? JSON.stringify(obj, null, '\t') : '';
}

// getting the appropriate query generator function based on the use case
function getQueryGeneratorFn(workflow: Workflow): QueryGeneratorFn {
  let fn;
  switch (workflow.use_case) {
    case USE_CASE.SEMANTIC_SEARCH:
    default: {
      fn = () => generateSemanticSearchQuery;
    }
  }
  return fn;
}

// getting the appropriate static values from the workflow based on the use case
function getWorkflowValues(workflow: Workflow): WorkflowValues {
  let values;
  switch (workflow.use_case) {
    case USE_CASE.SEMANTIC_SEARCH:
    default: {
      values = getSemanticSearchValues(workflow);
    }
  }
  return values;
}

// utility fn to generate a semantic search query
function generateSemanticSearchQuery(
  queryText: string,
  workflowValues: SemanticSearchValues
): {} {
  return {
    _source: {
      excludes: [`${workflowValues.vectorField}`],
    },
    query: {
      neural: {
        [workflowValues.vectorField]: {
          query_text: queryText,
          model_id: workflowValues.modelId,
          k: 5,
        },
      },
    },
  };
}
