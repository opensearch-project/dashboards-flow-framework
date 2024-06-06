/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCodeBlock,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
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

  console.log('ingestresponse in tools: ', props.ingestResponse);
  return (
    <EuiPanel paddingSize="m" grow={true} style={{ height: '100%' }}>
      <EuiFlexGroup
        direction="column"
        //justifyContent="spaceBetween"
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
        <EuiFlexItem
          grow={true}
          style={
            {
              // overflowY: 'scroll',
              // overflowX: 'hidden',
            }
          }
        >
          <EuiFlexGroup direction="column">
            <EuiFlexItem
              grow={true}
              // style={{
              //   overflowY: 'scroll',
              //   overflowX: 'hidden',
              // }}
            >
              <>
                {selectedTabId === TAB_ID.INGEST && (
                  //TODO: investigate existing editor more
                  <EuiCodeEditor
                    mode="json"
                    theme="textmate"
                    width="100%"
                    height="100%"
                    onScroll={(event) => {
                      console.log('scroll event fired!');
                    }}
                    value={props.ingestResponse}
                    onChange={(input) => {}}
                    readOnly={true}
                    setOptions={{
                      fontSize: '14px',
                    }}
                    aria-label="Code Editor"
                    tabSize={2}
                  />
                  // <EuiCodeBlock
                  //   language="json"
                  //   fontSize="m"
                  //   paddingSize="m"
                  //   // TODO: dynamically fetch the available space to determine the overflow height.
                  //   overflowHeight={100}
                  //   // style={{
                  //   //   height: '100%',
                  //   // }}
                  // >
                  //   {props.ingestResponse}
                  // </EuiCodeBlock>
                )}
                {selectedTabId === TAB_ID.QUERY && (
                  <EuiText>TODO: Run queries placeholder</EuiText>
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
