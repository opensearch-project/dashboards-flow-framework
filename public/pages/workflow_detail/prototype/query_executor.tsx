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
import { searchIndex, useAppDispatch } from '../../../store';
import { getCore } from '../../../services';
import { getFormattedJSONString } from './utils';

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
  const dispatch = useAppDispatch();
  // query state
  const [workflowValues, setWorkflowValues] = useState<WorkflowValues>();
  const [queryGeneratorFn, setQueryGeneratorFn] = useState<QueryGeneratorFn>();
  const [indexName, setIndexName] = useState<string>('');
  const [queryObj, setQueryObj] = useState<{}>({});
  const [formattedQuery, setFormattedQuery] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');

  // results state
  const [resultHits, setResultHits] = useState<{}[]>([]);
  const [formattedHits, setFormattedHits] = useState<string>('');

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

  // hooks to persist the formatted data. this is so we don't
  // re-execute the JSON formatting unless necessary
  useEffect(() => {
    setFormattedHits(getFormattedJSONString(processHits(resultHits)));
  }, [resultHits]);
  useEffect(() => {
    setFormattedQuery(getFormattedJSONString(queryObj));
  }, [queryObj]);

  //
  function onExecuteSearch() {
    dispatch(searchIndex({ index: indexName, body: queryObj }))
      .unwrap()
      .then(async (result) => {
        setResultHits(result.hits.hits);
      })
      .catch((error: any) => {
        getCore().notifications.toasts.addDanger(error);
        setResultHits([]);
      });
  }

  return (
    <EuiFlexGroup direction="row">
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <EuiText size="s">Execute queries to test out the results!</EuiText>
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
                <EuiButton onClick={onExecuteSearch} fill={false}>
                  Search
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
              value={formattedQuery}
              onChange={() => {}}
              readOnly={true}
              setOptions={{
                fontSize: '14px',
              }}
              aria-label="Code Editor"
              tabSize={2}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}></EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiText size="s">Results</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row">
              <EuiFlexItem>
                <EuiFieldText
                  placeholder={indexName}
                  prepend="Index:"
                  compressed={false}
                  disabled={true}
                  readOnly={true}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCodeEditor
              mode="json"
              theme="textmate"
              width="100%"
              height="50vh"
              value={formattedHits}
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

function processHits(hits: any[]): {}[] {
  return hits.map((hit) => hit._source);
}
