/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
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
  return (
    <>
      <EuiTitle>
        <h2>Tools</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <>
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
        <EuiSpacer size="m" />
        <EuiFlexGroup
          direction="column"
          justifyContent="spaceBetween"
          style={{
            height: '80%',
          }}
        >
          {selectedTabId === TAB_ID.INGEST && (
            <EuiFlexItem
              grow={true}
              style={{
                overflowY: 'scroll',
                overflowX: 'hidden',
              }}
            >
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="100%"
                value={props.ingestResponse}
                onChange={(input) => {}}
                readOnly={true}
                setOptions={{
                  fontSize: '14px',
                }}
                aria-label="Code Editor"
                tabSize={2}
              />
            </EuiFlexItem>
          )}
          {selectedTabId === TAB_ID.QUERY && (
            <EuiFlexItem>
              <EuiText>TODO: Run queries placeholder</EuiText>
            </EuiFlexItem>
          )}
          {selectedTabId === TAB_ID.ERRORS && (
            <EuiFlexItem>
              <EuiText>TODO: View errors placeholder</EuiText>
            </EuiFlexItem>
          )}
          {selectedTabId === TAB_ID.RESOURCES && (
            <EuiFlexItem>
              <Resources workflow={props.workflow} />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </>
    </>
  );
}
