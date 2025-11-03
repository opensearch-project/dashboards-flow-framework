/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiPanel,
  EuiHorizontalRule,
  EuiEmptyPrompt,
  EuiText,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { AppState, searchIndex, useAppDispatch } from '../../../../store';
import {
  Agent,
  AGENT_ID_PATH,
  AGENT_TYPE,
  IndexMappings,
  SearchResponse,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { SearchQuery } from './search_query';
import { SearchResults } from './search_results';
import { IndexSelector } from './index_selector';
import { AgentSelector } from './agent_selector';
import { GeneratedQuery } from './generated_query';
import {
  AGENTIC_SEARCH_COMPONENT_PANEL_HEIGHT,
  getDataSourceId,
} from '../../../../utils';
import { NoIndicesCallout } from '../components';
import '../agentic_search_styles.scss';

interface TestFlowProps {
  uiConfig: WorkflowConfig | undefined;
  fieldMappings: IndexMappings | undefined;
  saveWorkflow(): Promise<boolean>;
  configurePanelOpen: boolean;
}

const HorizontalRuleFlexItem = () => (
  <EuiFlexItem grow={false} style={{ marginTop: '0px', marginBottom: '0px' }}>
    <EuiHorizontalRule margin="none" />
  </EuiFlexItem>
);

export function TestFlow(props: TestFlowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();
  const { agents, loading } = useSelector((state: AppState) => state.ml);
  const { indices, loading: opensearchLoading } = useSelector(
    (state: AppState) => state.opensearch
  );
  const noIndices = Object.values(indices ?? {}).length === 0;

  const selectedIndexId = getIn(values, 'search.index.name', '') as string;
  const finalQuery = useMemo(() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  }, [getIn(values, 'search.request')]);

  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;
  const [agent, setAgent] = useState<Partial<Agent>>({});
  useEffect(() => {
    const agentRedux = getIn(agents, selectedAgentId, {});
    if (!isEmpty(selectedAgentId) && !isEmpty(agentRedux)) {
      setAgent(agentRedux);
    }
  }, [selectedAgentId, agents]);

  // the runtime-specific pipeline to be ran inline with the search query
  const [runtimeSearchPipeline, setRuntimeSearchPipeline] = useState<{}>({});

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResponse, setSearchResponse] = useState<any | undefined>(
    undefined
  );
  const generatedQuery = getGeneratedQueryFromResponse(searchResponse);

  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // persist the most recent memory ID, if found in the search response
  const [memoryId, setMemoryId] = useState<string>('');

  const handleSearch = () => {
    // "Autosave" by updating the workflow after every search is run.
    props.saveWorkflow();

    // Validate that all required fields are selected
    if (!selectedAgentId) {
      setFormError('Please select an agent');
      return;
    } else if (isEmpty(selectedIndexId) && agent?.type === AGENT_TYPE.FLOW) {
      setFormError('Please select an index');
      return;
    } else if (!finalQuery?.query?.agentic?.query_text) {
      setFormError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(undefined);
    setFormError(undefined);

    dispatch(
      searchIndex({
        apiBody: {
          index: selectedIndexId,
          body: injectPipelineIntoQuery(finalQuery),
        },
        dataSourceId,
        verbose: false,
      })
    )
      .unwrap()
      .then((response: SearchResponse) => {
        setSearchResponse(response);

        // persist a new memory ID to be optionally injected into the query from the user.
        const respMemoryId = response?.ext?.memory_id;
        const respMemoryIdStr =
          typeof respMemoryId === 'string' ? respMemoryId.trim() : '';
        const existingMemoryId = finalQuery?.query?.agentic?.memory_id;
        const existingMemoryIdStr =
          typeof existingMemoryId === 'string' ? existingMemoryId.trim() : '';
        if (respMemoryIdStr && existingMemoryIdStr !== respMemoryIdStr) {
          setMemoryId(respMemoryIdStr);
        }
      })
      .catch((error) => {
        setSearchError(error);
        setSearchResponse(undefined);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  function injectPipelineIntoQuery(finalQuery: any): {} {
    return {
      ...finalQuery,
      search_pipeline: runtimeSearchPipeline,
    };
  }

  return (
    <>
      {loading ? (
        <EuiLoadingSpinner size="l" />
      ) : (
        <EuiFlexGroup
          direction="column"
          gutterSize="m"
          style={{
            height: AGENTIC_SEARCH_COMPONENT_PANEL_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <EuiFlexItem grow={false} style={{ marginBottom: '0px' }}>
            <EuiFlexGroup
              direction="row"
              gutterSize="s"
              justifyContent="spaceBetween"
            >
              <EuiFlexItem grow={false}>
                <EuiTitle>
                  <h3>Test flow</h3>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup
                  direction="row"
                  gutterSize="s"
                  alignItems="center"
                >
                  <EuiFlexItem grow={false}>
                    <AgentSelector />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText color="subdued" style={{ marginRight: '8px' }}>
                      |
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <IndexSelector agentType={agent?.type} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem className="agentic-search-workspace-panel">
            <EuiPanel paddingSize="none" hasBorder={false} hasShadow={false}>
              <EuiFlexGroup direction="column" gutterSize="m">
                {!opensearchLoading && noIndices && (
                  <EuiFlexItem grow={false}>
                    <NoIndicesCallout />
                  </EuiFlexItem>
                )}
                {formError !== undefined && (
                  <EuiFlexItem grow={false}>
                    <EuiCallOut size="s" color="danger">
                      <p>{formError}</p>
                    </EuiCallOut>
                  </EuiFlexItem>
                )}
                <EuiFlexItem grow={false}>
                  <SearchQuery
                    setSearchPipeline={setRuntimeSearchPipeline}
                    uiConfig={props.uiConfig}
                    fieldMappings={props.fieldMappings}
                    handleSearch={handleSearch}
                    isSearching={isSearching}
                    agentType={agent?.type}
                    memoryId={memoryId}
                  />
                </EuiFlexItem>
                {!isSearching && generatedQuery !== undefined && (
                  <>
                    <HorizontalRuleFlexItem />
                    <EuiFlexItem>
                      <GeneratedQuery query={generatedQuery} />
                    </EuiFlexItem>
                  </>
                )}
                {!isSearching && !isEmpty(searchResponse) && (
                  <>
                    <HorizontalRuleFlexItem />
                    <EuiFlexItem>
                      <SearchResults searchResponse={searchResponse} />
                    </EuiFlexItem>
                    <HorizontalRuleFlexItem />
                  </>
                )}
                {isSearching && (
                  <EuiEmptyPrompt
                    iconType={'generate'}
                    title={<h4>Searching...</h4>}
                    titleSize="xs"
                  />
                )}
                {isEmpty(searchResponse) &&
                  isEmpty(searchError) &&
                  !isSearching && (
                    <EuiEmptyPrompt
                      iconType={'search'}
                      title={<h4>Run a search to view results</h4>}
                      titleSize="xs"
                    />
                  )}
                {searchError !== undefined && (
                  <EuiEmptyPrompt
                    iconType={'alert'}
                    iconColor="danger"
                    title={<h4>Error running search</h4>}
                    titleSize="xs"
                    body={
                      <EuiText size="xs" style={{ textAlign: 'left' }}>
                        {searchError}
                      </EuiText>
                    }
                  />
                )}
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  );
}

// Util fn to extract the generated search query from the search response
function getGeneratedQueryFromResponse(searchResponse?: any): {} | undefined {
  try {
    return JSON.parse(searchResponse?.ext?.dsl_query);
  } catch {}
  {
    return undefined;
  }
}
