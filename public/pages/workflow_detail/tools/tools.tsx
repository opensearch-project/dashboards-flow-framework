/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { Resources } from './resources';

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
    name: 'Run queries',
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
  const [selectedTabId, setSelectedTabId] = useState<string>(TAB_ID.INGEST);

  // auto-navigate to ingest response if a populated value has been set, indicating ingest has been ran
  useEffect(() => {
    if (!isEmpty(props.ingestResponse)) {
      setSelectedTabId(TAB_ID.INGEST);
    }
  }, [props.ingestResponse]);

  // auto-navigate to query response if a populated value has been set, indicating search has been ran
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
          <EuiTabs size="m" expand={false}>
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
                  // TODO: known issue with the editor where resizing the resizablecontainer does not
                  // trigger vertical scroll updates. Updating the window, or reloading the component
                  // by switching tabs etc. will refresh it correctly. This applies to the code editor
                  // components in both ingest and query below.
                  <EuiCodeEditor
                    mode="json"
                    theme="textmate"
                    width="100%"
                    height="100%"
                    value={props.ingestResponse}
                    readOnly={true}
                    setOptions={{
                      fontSize: '12px',
                      autoScrollEditorIntoView: true,
                    }}
                    tabSize={2}
                  />
                )}
                {selectedTabId === TAB_ID.QUERY && (
                  <EuiCodeEditor
                    mode="json"
                    theme="textmate"
                    width="100%"
                    height="100%"
                    value={props.queryResponse}
                    readOnly={true}
                    setOptions={{
                      fontSize: '12px',
                      autoScrollEditorIntoView: true,
                    }}
                    tabSize={2}
                  />
                )}
                {selectedTabId === TAB_ID.ERRORS && (
                  <EuiText>TODO: View errors placeholder</EuiText>
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
