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
import { ingest, useAppDispatch } from '../../../store';
import { getCore } from '../../../services';
import { getFormattedJSONString } from './utils';

interface IngestorProps {
  workflow: Workflow;
}

type WorkflowValues = {
  modelId: string;
};

type SemanticSearchValues = WorkflowValues & {
  inputField: string;
  vectorField: string;
};

type DocGeneratorFn = (
  queryText: string,
  workflowValues: SemanticSearchValues
) => {};

/**
 * A basic and flexible UI for ingesting some documents against an index. Sets up guardrails to limit
 * what is customized in the document, and setting readonly values based on the workflow's use case
 * and details.
 *
 * For example, given a semantic search workflow configured on index A, with model B, input field C, and vector field D,
 * the UI will enforce the ingested document to include C, and ingest it against A.
 */
export function Ingestor(props: IngestorProps) {
  const dispatch = useAppDispatch();
  // query state
  const [workflowValues, setWorkflowValues] = useState<WorkflowValues>();
  const [docGeneratorFn, setDocGeneratorFn] = useState<DocGeneratorFn>();
  const [indexName, setIndexName] = useState<string>('');
  const [docObj, setDocObj] = useState<{}>({});
  const [formattedDoc, setFormattedDoc] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');

  // results state
  const [response, setResponse] = useState<{}>({});
  const [formattedResponse, setFormattedResponse] = useState<string>('');

  // hook to set all of the workflow-related fields based on the use case
  useEffect(() => {
    setWorkflowValues(getWorkflowValues(props.workflow));
    setDocGeneratorFn(getDocGeneratorFn(props.workflow));
    setIndexName(getIndexName(props.workflow));
  }, [props.workflow]);

  // hook to generate the query once all dependent input vars are available
  useEffect(() => {
    if (docGeneratorFn && workflowValues) {
      setDocObj(docGeneratorFn(userInput, workflowValues));
    }
  }, [userInput, docGeneratorFn, workflowValues]);

  // hooks to persist the formatted data. this is so we don't
  // re-execute the JSON formatting unless necessary
  useEffect(() => {
    setFormattedResponse(getFormattedJSONString(response));
  }, [response]);
  useEffect(() => {
    setFormattedDoc(getFormattedJSONString(docObj));
  }, [docObj]);

  //
  function onExecuteIngest() {
    dispatch(ingest({ index: indexName, doc: docObj }))
      .unwrap()
      .then(async (result) => {
        setResponse(result);
      })
      .catch((error: any) => {
        getCore().notifications.toasts.addDanger(error);
        setResponse({});
      });
  }

  return (
    <EuiFlexGroup direction="row">
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <EuiText size="s">Ingest some sample data to get started.</EuiText>
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
                <EuiButton onClick={onExecuteIngest} fill={false}>
                  Ingest
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
              value={formattedDoc}
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
            <EuiText size="s">Response</EuiText>
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
              value={formattedResponse}
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

// getting the appropriate doc generator function based on the use case
function getDocGeneratorFn(workflow: Workflow): DocGeneratorFn {
  let fn;
  switch (workflow.use_case) {
    case USE_CASE.SEMANTIC_SEARCH:
    default: {
      fn = () => generateSemanticSearchDoc;
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

// utility fn to generate a document suited for semantic search
function generateSemanticSearchDoc(
  docValue: string,
  workflowValues: SemanticSearchValues
): {} {
  return {
    [workflowValues.inputField]: docValue,
  };
}
