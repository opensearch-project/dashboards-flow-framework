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
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Resources } from './resources';
import { Query } from './query';
import { Ingest } from './ingest';
import { Errors } from './errors';

interface ToolsProps {
  workflow?: Workflow;
  ingestResponse: string;
  queryResponse: string;
}

enum TAB_ID {
  INGEST = 'ingest',
  QUERY = 'query',
  ERRORS = 'errors',
  RESOURCES = 'resources',
}

const inputTabs = [
  {
    id: TAB_ID.INGEST,
    name: 'Run ingestion',
    disabled: false,
  },
  {
    id: TAB_ID.QUERY,
    name: 'Run query',
    disabled: false,
  },
  {
    id: TAB_ID.ERRORS,
    name: 'Errors',
    disabled: false,
  },
  {
    id: TAB_ID.RESOURCES,
    name: 'Resources',
    disabled: false,
  },
];

/**
 * The base Tools component for performing ingest and search, viewing resources, and debugging.
 */
export function Tools(props: ToolsProps) {
  // error message state
  const { opensearch, workflows } = useSelector((state: AppState) => state);
  const opensearchError = opensearch.errorMessage;
  const workflowsError = workflows.errorMessage;
  const [curErrorMessage, setCurErrorMessage] = useState<string>('');

  // selected tab state
  const [selectedTabId, setSelectedTabId] = useState<string>(TAB_ID.INGEST);

  // auto-navigate to errors tab if a new error has been set as a result of
  // executing OpenSearch or Flow Framework workflow APIs, or from the workflow state
  // (note that if provision/deprovision fails, there is no concrete exception returned at the API level -
  // it is just set in the workflow's error field when fetching workflow state)
  useEffect(() => {
    setCurErrorMessage(opensearchError);
    if (!isEmpty(opensearchError)) {
      setSelectedTabId(TAB_ID.ERRORS);
    }
  }, [opensearchError]);

  useEffect(() => {
    setCurErrorMessage(workflowsError);
    if (!isEmpty(workflowsError)) {
      setSelectedTabId(TAB_ID.ERRORS);
    }
  }, [workflowsError]);
  useEffect(() => {
    setCurErrorMessage(props.workflow?.error || '');
    if (!isEmpty(props.workflow?.error)) {
      setSelectedTabId(TAB_ID.ERRORS);
    }
  }, [props.workflow?.error]);

  // auto-navigate to ingest tab if a populated value has been set, indicating ingest has been ran
  useEffect(() => {
    if (!isEmpty(props.ingestResponse)) {
      setSelectedTabId(TAB_ID.INGEST);
    }
  }, [props.ingestResponse]);

  // auto-navigate to query tab if a populated value has been set, indicating search has been ran
  useEffect(() => {
    if (!isEmpty(props.queryResponse)) {
      setSelectedTabId(TAB_ID.QUERY);
    }
  }, [props.queryResponse]);

  return (
    <EuiPanel paddingSize="m" grow={true} style={{ height: '100%' }}>
      <EuiFlexGroup
        direction="column"
        style={{
          height: '100%',
        }}
      >
        <EuiFlexItem grow={false}>
          <EuiTitle>
            <h2>Tools</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTabs size="s" expand={false}>
            {inputTabs.map((tab, idx) => {
              return (
                <EuiTab
                  onClick={() => setSelectedTabId(tab.id)}
                  isSelected={tab.id === selectedTabId}
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
                {selectedTabId === TAB_ID.INGEST && (
                  <Ingest ingestResponse={props.ingestResponse} />
                )}
                {selectedTabId === TAB_ID.QUERY && (
                  <Query queryResponse={props.queryResponse} />
                )}
                {selectedTabId === TAB_ID.ERRORS && (
                  <Errors errorMessage={curErrorMessage} />
                )}
                {selectedTabId === TAB_ID.RESOURCES && (
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
