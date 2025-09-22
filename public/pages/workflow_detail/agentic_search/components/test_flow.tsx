/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiPanel,
} from '@elastic/eui';
import { searchIndex, useAppDispatch } from '../../../../store';
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
  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const handleClear = () => {
    setSearchResponse(undefined);
  };

  const handleSearch = () => {
    // "Autosave" by updating the workflow after every search is run.
    props.saveWorkflow();

    // Validate that all required fields are selected
    if (!finalQuery?.query?.agentic?.query_text) {
      setFormError('Please enter a search query');
      return;
    }

    if (!selectedIndexId) {
      setFormError('Please select an index');
      return;
    }

    if (!selectedAgentId) {
      setFormError('Please select an agent');
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
            {searchError !== undefined && (
              <EuiFlexItem grow={false} style={{ marginBottom: '-12px' }}>
                <EuiCallOut
                  size="s"
                  title="Error running search"
                  color="danger"
                  iconType="alert"
                >
                  <p>{searchError}</p>
                </EuiCallOut>
                <EuiSpacer size="m" />
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <SearchQuery
                setSearchPipeline={setRuntimeSearchPipeline}
                uiConfig={props.uiConfig}
                fieldMappings={props.fieldMappings}
                handleSearch={handleSearch}
                isSearching={isSearching}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <SearchResults
                searchResponse={searchResponse}
                handleClear={handleClear}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
