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
  CONFIG_STEP,
  customStringify,
  FETCH_ALL_QUERY,
  INSPECTOR_TAB_ID,
  INSPECTOR_TABS,
  QueryParam,
  SearchResponse,
  Workflow,
  WorkflowFormValues,
} from '../../../../common';
import { Resources } from './resources';
import { Query } from './query';
import {
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
} from '../../../utils';

interface ToolsProps {
  workflow?: Workflow;
  ingestResponse: string;
  selectedTabId: INSPECTOR_TAB_ID;
  setSelectedTabId: (tabId: INSPECTOR_TAB_ID) => void;
  selectedStep: CONFIG_STEP;
}

const PANEL_TITLE = 'Inspect flows';

/**
 * The base Tools component for performing ingest and search, viewing resources, and debugging.
 */
export function Tools(props: ToolsProps) {
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
          <EuiFlexGroup direction="column">
            <EuiFlexItem grow={true}>
              <>
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
