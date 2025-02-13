/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useEffect, useState } from 'react';
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
import {
  CONFIG_STEP,
  INSPECTOR_TAB_ID,
  INSPECTOR_TABS,
  Workflow,
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
