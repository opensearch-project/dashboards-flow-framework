/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiToolTip,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiSmallButton,
  EuiPanel,
} from '@elastic/eui';
import { AppState, searchIndex, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils/utils';
import { WorkflowConfig, WorkflowFormValues } from '../../../../../common';
import { SearchQuery } from './search_query';
import { SearchResults } from './search_results';

interface TestFlowProps {
  uiConfig: WorkflowConfig | undefined;
  fieldMappings: any;
  saveWorkflow(): Promise<boolean>;
}

export function TestFlow(props: TestFlowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();

  const { errorMessage: opensearchError } = useSelector(
    (state: AppState) => state.opensearch
  );

  const selectedIndexId = getIn(values, 'search.index.name', '') as string;
  const selectedAgentId = getIn(values, 'search.requestAgentId', '') as string;
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();

  // the runtime-specific pipeline to be ran inline with the search query
  const [runtimeSearchPipeline, setRuntimeSearchPipeline] = useState<{}>({});

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResponse, setSearchResponse] = useState<any | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (opensearchError) {
      setError(opensearchError);
    }
  }, [opensearchError]);

  const handleClear = () => {
    setSearchResponse(undefined);
    setError(undefined);
  };

  const handleSearch = () => {
    // "Autosave" by updating the workflow after every search is run.
    props.saveWorkflow();

    // Validate that all required fields are selected
    if (!finalQuery?.query?.agentic?.query_text) {
      setError('Please enter a search query');
      return;
    }

    if (!selectedIndexId) {
      setError('Please select an index');
      return;
    }

    if (!selectedAgentId) {
      setError('Please select an agent');
      return;
    }

    // All validations passed, proceed with search
    setIsSearching(true);
    setError(undefined);

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
        setIsSearching(false);
        setSearchResponse(response);
      })
      .catch((error) => {
        setIsSearching(false);
        setError(`Search failed: ${error}`);
      });
  };

  function injectPipelineIntoQuery(finalQuery: any): {} {
    return {
      ...finalQuery,
      search_pipeline: runtimeSearchPipeline,
    };
  }

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="m"
      style={{ height: '100%', overflow: 'hidden' }}
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
            <EuiFlexItem grow={false}>
              <SearchQuery
                setSearchPipeline={setRuntimeSearchPipeline}
                uiConfig={props.uiConfig}
                fieldMappings={props.fieldMappings}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup direction="row" gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiToolTip
                        content={
                          !finalQuery?.query?.agentic?.query_text ||
                          !selectedIndexId ||
                          !selectedAgentId
                            ? 'Select an index and agent, and enter a search query'
                            : 'Search using a configured agent'
                        }
                      >
                        <EuiSmallButton
                          onClick={handleSearch}
                          fill
                          iconType="search"
                          isLoading={isSearching}
                          isDisabled={
                            !finalQuery?.query?.agentic?.query_text ||
                            !selectedIndexId ||
                            !selectedAgentId
                          }
                        >
                          Search
                        </EuiSmallButton>
                      </EuiToolTip>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup direction="row" gutterSize="s">
                    {searchResponse && (
                      <EuiFlexItem grow={false}>
                        <EuiToolTip content="Clear search results and form">
                          <EuiSmallButton
                            onClick={handleClear}
                            iconType="eraser"
                          >
                            Clear results
                          </EuiSmallButton>
                        </EuiToolTip>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            {error !== undefined && (
              <EuiFlexItem grow={false}>
                <EuiCallOut title="Error" color="danger" iconType="alert">
                  <p>{error}</p>
                </EuiCallOut>
                <EuiSpacer size="m" />
              </EuiFlexItem>
            )}
            {searchResponse !== undefined && (
              <EuiFlexItem>
                <SearchResults searchResponse={searchResponse} />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
