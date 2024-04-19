/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageContent,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { QueryExecutor } from './query_executor';
import { Ingestor } from './ingestor';

interface PrototypeProps {
  workflow?: Workflow;
}

enum TAB_ID {
  INGEST = 'ingest',
  QUERY = 'query',
}

const inputTabs = [
  {
    id: TAB_ID.INGEST,
    name: '1. Ingest Data',
    disabled: false,
  },
  {
    id: TAB_ID.QUERY,
    name: '2. Query data',
    disabled: false,
  },
];

/**
 * A simple prototyping page to perform ingest and search.
 */
export function Prototype(props: PrototypeProps) {
  const [selectedTabId, setSelectedTabId] = useState<string>(TAB_ID.INGEST);
  return (
    <EuiPageContent>
      <EuiTitle>
        <h2>Prototype</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      {props.workflow?.resourcesCreated &&
      props.workflow?.resourcesCreated.length > 0 ? (
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
          <EuiFlexGroup direction="column">
            {selectedTabId === TAB_ID.INGEST && (
              <EuiFlexItem>
                <Ingestor workflow={props.workflow} />
              </EuiFlexItem>
            )}
            {selectedTabId === TAB_ID.QUERY && (
              <EuiFlexItem>
                <QueryExecutor workflow={props.workflow} />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      ) : (
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>No resources available</h2>}
          titleSize="s"
          body={
            <>
              <EuiText>
                Provision the workflow to generate resources in order to start
                prototyping.
              </EuiText>
            </>
          }
        />
      )}
    </EuiPageContent>
  );
}
