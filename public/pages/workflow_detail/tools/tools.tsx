/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTab,
  EuiTabs,
  EuiText,
} from '@elastic/eui';
import { AppState } from '../../../store';
import {
  CONFIG_STEP,
  customStringify,
  FETCH_ALL_QUERY,
  INSPECTOR_TAB_ID,
  INSPECTOR_TABS,
  QueryParam,
  SearchResponse,
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { Resources } from './resources';
import { Query } from './query';
import { Ingest } from './ingest';
import { Errors } from './errors';
import {
  formatProcessorError,
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
} from '../../../utils';
import { Workspace } from '../workspace';

interface ToolsProps {
  workflow?: Workflow;
  ingestResponse: string;
  selectedTabId: INSPECTOR_TAB_ID;
  setSelectedTabId: (tabId: INSPECTOR_TAB_ID) => void;
  selectedStep: CONFIG_STEP;
  uiConfig?: WorkflowConfig;
}

const PANEL_TITLE = 'Inspect flows';

/**
 * The base Tools component for performing ingest and search, viewing resources, and debugging.
 */
export function Tools(props: ToolsProps) {
  const [workspaceKey, setWorkspaceKey] = useState<number>(0);
  // error message states. Error may come from several different sources.
  const { opensearch, workflows } = useSelector((state: AppState) => state);
  const opensearchError = opensearch.errorMessage;
  const workflowsError = workflows.errorMessage;
  const {
    ingestPipeline: ingestPipelineErrors,
    searchPipeline: searchPipelineErrors,
  } = useSelector((state: AppState) => state.errors);
  const [curErrorMessages, setCurErrorMessages] = useState<
    (string | ReactNode)[]
  >([]);
  const { values } = useFormikContext<WorkflowFormValues>();

  // Standalone / sandboxed search request state. Users can test things out
  // without updating the base form / persisted value.
  // Update if the parent form values are changed, or if a newly-created search pipeline is detected.
  const [queryRequest, setQueryRequest] = useState<string>('');
  useEffect(() => {
    if (!isEmpty(values?.search?.request)) {
      setQueryRequest(values?.search?.request);
    } else {
      setQueryRequest(customStringify(FETCH_ALL_QUERY));
    }
  }, [values?.search?.request]);

  // query response state
  const [queryResponse, setQueryResponse] = useState<
    SearchResponse | undefined
  >(undefined);

  // query params state
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Propagate any errors coming from opensearch API calls, including ingest/search pipeline verbose calls.
  useEffect(() => {
    if (
      !isEmpty(opensearchError) ||
      !isEmpty(ingestPipelineErrors) ||
      !isEmpty(searchPipelineErrors)
    ) {
      if (!isEmpty(opensearchError)) {
        setCurErrorMessages([opensearchError]);
      } else if (!isEmpty(ingestPipelineErrors)) {
        setCurErrorMessages([
          'Data not ingested. Errors found with the following ingest processor(s):',
          ...Object.values(ingestPipelineErrors).map((ingestPipelineError) =>
            formatProcessorError(ingestPipelineError)
          ),
        ]);
      } else if (!isEmpty(searchPipelineErrors)) {
        setCurErrorMessages([
          'Errors found with the following search processor(s)',
          ...Object.values(searchPipelineErrors).map((searchPipelineError) =>
            formatProcessorError(searchPipelineError)
          ),
        ]);
      }
    } else {
      setCurErrorMessages([]);
    }
  }, [opensearchError, ingestPipelineErrors, searchPipelineErrors]);

  // Propagate any errors coming from the workflow, either runtime from API call, or persisted in the indexed workflow itself.
  useEffect(() => {
    setCurErrorMessages(!isEmpty(workflowsError) ? [workflowsError] : []);
  }, [workflowsError]);
  useEffect(() => {
    setCurErrorMessages(props.workflow?.error ? [props.workflow.error] : []);
  }, [props.workflow?.error]);

  // auto-navigate to errors tab if new errors have been found
  useEffect(() => {
    if (curErrorMessages.length > 0) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.ERRORS);
    }
  }, [curErrorMessages]);

  // auto-navigate to ingest tab if a populated value has been set, indicating ingest has been ran
  useEffect(() => {
    if (!isEmpty(props.ingestResponse)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.INGEST);
    }
  }, [props.ingestResponse]);

  // Force the workspace component to remount when the preview tab becomes active.
  // The graph cannot be rendered correctly in ReactFlow when initialized in a hidden container/inactive tab
  // See: https://reactflow.dev/learn/troubleshooting
  useEffect(() => {
    if (props.selectedTabId === INSPECTOR_TAB_ID.PREVIEW) {
      setWorkspaceKey(Date.now());
    }
  }, [props.selectedTabId]);

  return (
    <EuiPanel
      paddingSize="m"
      borderRadius="l"
      grow={true}
      style={{ height: '100%' }}
    >
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <EuiFlexItem grow={false} style={{ marginBottom: '0px' }}>
          <EuiText size="s">
            <h3>{PANEL_TITLE}</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTabs size="s" expand={false}>
            {INSPECTOR_TABS.map((tab, idx) => {
              return (
                <EuiTab
                  onClick={() => props.setSelectedTabId(tab.id)}
                  isSelected={tab.id === props.selectedTabId}
                  disabled={tab.disabled}
                  key={idx}
                >
                  {tab.name}
                </EuiTab>
              );
            })}
          </EuiTabs>
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <EuiFlexGroup direction="column" style={{ height: '100%' }}>
            <EuiFlexItem grow={true}>
              <>
                {props.selectedTabId === INSPECTOR_TAB_ID.PREVIEW && (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      minHeight: '500px',
                    }}
                  >
                    <Workspace
                      key={workspaceKey}
                      workflow={props.workflow}
                      uiConfig={props.uiConfig}
                    />
                  </div>
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.INGEST && (
                  <Ingest ingestResponse={props.ingestResponse} />
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.TEST && (
                  <Query
                    hasSearchPipeline={hasProvisionedSearchResources(
                      props.workflow
                    )}
                    hasIngestResources={hasProvisionedIngestResources(
                      props.workflow
                    )}
                    selectedStep={props.selectedStep}
                    queryRequest={queryRequest}
                    setQueryRequest={setQueryRequest}
                    queryResponse={queryResponse}
                    setQueryResponse={setQueryResponse}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                  />
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.ERRORS && (
                  <Errors errorMessages={curErrorMessages} />
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.RESOURCES && (
                  <Resources workflow={props.workflow} />
                )}
              </>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
