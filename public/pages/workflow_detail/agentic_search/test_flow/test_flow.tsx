/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
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
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { SearchQuery } from './search_query';
import { SearchResults } from './search_results';
import { IndexSelector } from './index_selector';
import { GeneratedQuery } from './generated_query';
import {
  AGENTIC_SEARCH_COMPONENT_PANEL_HEIGHT,
  getDataSourceId,
} from '../../../../utils';

interface TestFlowProps {
  uiConfig: WorkflowConfig | undefined;
  fieldMappings: IndexMappings | undefined;
  saveWorkflow(): Promise<boolean>;
}

export function TestFlow(props: TestFlowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();
  const { agents, loading } = useSelector((state: AppState) => state.ml);

  const selectedIndexId = getIn(values, 'search.index.name', '') as string;
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();

  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;
  const [agent, setAgent] = useState<Partial<Agent>>({});
  useEffect(() => {
    const agentRedux = agents[selectedAgentId];
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
        verbose: true,
      })
    )
      .unwrap()
      .then((response) => {
        setSearchResponse(response);
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
          <EuiFlexItem grow={false}>
            <EuiTitle>
              <h3>Test flow</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem
            style={{
              overflowY: 'auto',
              scrollbarGutter: 'auto',
              scrollbarWidth: 'auto',
              overflowX: 'hidden',
            }}
          >
            <EuiPanel color="subdued" paddingSize="s">
              <EuiFlexGroup direction="column" gutterSize="m">
                {formError !== undefined && (
                  <EuiFlexItem grow={false} style={{ marginBottom: '-12px' }}>
                    <EuiCallOut
                      size="s"
                      title="Error"
                      color="danger"
                      iconType="alert"
                    >
                      <p>{formError}</p>
                    </EuiCallOut>
                    <EuiSpacer size="m" />
                  </EuiFlexItem>
                )}
                <EuiFlexItem grow={false}>
                  <IndexSelector agentType={agent?.type} />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <SearchQuery
                    setSearchPipeline={setRuntimeSearchPipeline}
                    uiConfig={props.uiConfig}
                    fieldMappings={props.fieldMappings}
                    handleSearch={handleSearch}
                    isSearching={isSearching}
                  />
                </EuiFlexItem>
                {!isSearching && generatedQuery !== undefined && (
                  <>
                    <EuiFlexItem
                      grow={false}
                      style={{ marginTop: '0px', marginBottom: '0px' }}
                    >
                      <EuiHorizontalRule margin="none" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <GeneratedQuery query={generatedQuery} />
                    </EuiFlexItem>
                  </>
                )}
                {!isSearching && !isEmpty(searchResponse) && (
                  <>
                    <EuiFlexItem
                      grow={false}
                      style={{ marginTop: '0px', marginBottom: '0px' }}
                    >
                      <EuiHorizontalRule margin="none" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <SearchResults searchResponse={searchResponse} />
                    </EuiFlexItem>
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

// Util fn to extract the generated search query from the agentic_query_translator processor via the verbose search response
function getGeneratedQueryFromResponse(searchResponse?: any): {} | undefined {
  if (!searchResponse?.processor_results) {
    return undefined;
  }

  // Loop through all processor results to find the agentic_query_translator
  const processorResults = searchResponse.processor_results;
  for (const processor of processorResults) {
    if (
      processor.processor_name === 'agentic_query_translator' &&
      processor.output_data
    ) {
      return processor.output_data as {};
    }
  }
  return undefined;
}
