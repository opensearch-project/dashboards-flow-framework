/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
import {
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
import {
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
} from '../../../utils';
import { Workspace } from '../workspace';

interface ToolsProps {
  workflow?: Workflow;
  selectedTabId: INSPECTOR_TAB_ID;
  setSelectedTabId: (tabId: INSPECTOR_TAB_ID) => void;
  uiConfig?: WorkflowConfig;
}

const PANEL_TITLE = 'Inspect';

/**
 * The base Tools component for performing ingest and search, viewing resources, and debugging.
 */
export function Tools(props: ToolsProps) {
  const [workspaceKey, setWorkspaceKey] = useState<number>(0);
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

                {props.selectedTabId === INSPECTOR_TAB_ID.TEST && (
                  <Query
                    uiConfig={props.uiConfig}
                    hasSearchPipeline={hasProvisionedSearchResources(
                      props.workflow
                    )}
                    hasIngestResources={hasProvisionedIngestResources(
                      props.workflow
                    )}
                    queryRequest={queryRequest}
                    setQueryRequest={setQueryRequest}
                    queryResponse={queryResponse}
                    setQueryResponse={setQueryResponse}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                  />
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
