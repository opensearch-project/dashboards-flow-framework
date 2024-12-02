/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTab,
  EuiTabs,
  EuiText,
} from '@elastic/eui';
import { INSPECTOR_TAB_ID, INSPECTOR_TABS, Workflow } from '../../../../common';
import { Resources } from './resources';
import { Query } from './query';
import { Ingest } from './ingest';
import { Errors } from './errors';

interface ToolsProps {
  workflow?: Workflow;
  ingestResponse: string;
  queryResponse: string;
  setQueryResponse: (queryResponse: string) => void;
  selectedTabId: INSPECTOR_TAB_ID;
  setSelectedTabId: (tabId: INSPECTOR_TAB_ID) => void;
}

const PANEL_TITLE = 'Inspector';

/**
 * The base Tools component for performing ingest and search, viewing resources, and debugging.
 */
export function Tools(props: ToolsProps) {
  // error message state
  const { opensearch, workflows } = useSelector((state: AppState) => state);
  const opensearchError = opensearch.errorMessage;
  const workflowsError = workflows.errorMessage;
  const [curErrorMessage, setCurErrorMessage] = useState<string>('');

  // auto-navigate to errors tab if a new error has been set as a result of
  // executing OpenSearch or Flow Framework workflow APIs, or from the workflow state
  // (note that if provision/deprovision fails, there is no concrete exception returned at the API level -
  // it is just set in the workflow's error field when fetching workflow state)
  useEffect(() => {
    setCurErrorMessage(opensearchError);
    if (!isEmpty(opensearchError)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.ERRORS);
    }
  }, [opensearchError]);

  useEffect(() => {
    setCurErrorMessage(workflowsError);
    if (!isEmpty(workflowsError)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.ERRORS);
    }
  }, [workflowsError]);
  useEffect(() => {
    setCurErrorMessage(props.workflow?.error || '');
    if (!isEmpty(props.workflow?.error)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.ERRORS);
    }
  }, [props.workflow?.error]);

  // auto-navigate to ingest tab if a populated value has been set, indicating ingest has been ran
  useEffect(() => {
    if (!isEmpty(props.ingestResponse)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.INGEST);
    }
  }, [props.ingestResponse]);

  // auto-navigate to query tab if a populated value has been set, indicating search has been ran
  useEffect(() => {
    if (!isEmpty(props.queryResponse)) {
      props.setSelectedTabId(INSPECTOR_TAB_ID.QUERY);
    }
  }, [props.queryResponse]);

  return (
    <EuiPanel
      paddingSize="m"
      borderRadius="l"
      grow={true}
      style={{ height: '100%' }}
    >
      <EuiFlexGroup
        direction="column"
        style={{
          height: '100%',
        }}
      >
        <EuiFlexItem grow={false} style={{ marginBottom: '0px' }}>
          <EuiText size="s">
            <h2>{PANEL_TITLE}</h2>
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
          <EuiFlexGroup direction="column">
            <EuiFlexItem grow={true}>
              <>
                {props.selectedTabId === INSPECTOR_TAB_ID.INGEST && (
                  <Ingest ingestResponse={props.ingestResponse} />
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.QUERY && (
                  <Query
                    queryResponse={props.queryResponse}
                    setQueryResponse={props.setQueryResponse}
                  />
                )}
                {props.selectedTabId === INSPECTOR_TAB_ID.ERRORS && (
                  <Errors errorMessage={curErrorMessage} />
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
