/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiButtonGroup,
  EuiIcon,
  EuiTitle,
  EuiEmptyPrompt,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { customStringify } from '../../../../../common';
import { ResultsTable } from '../../../../general_components/';

interface SearchResultsProps {
  handleClear(): void;
  searchResponse?: any;
}

/**
 * Enum for results view tab options
 */
enum RESULTS_VIEW {
  GENERATED_QUERY = 'generated_pipeline',
  HITS = 'hits',
  AGGREGATIONS = 'aggregations',
  RAW_RESPONSE = 'raw_response',
}

const RESULTS_VIEW_OPTIONS = [
  {
    id: RESULTS_VIEW.GENERATED_QUERY,
    label: 'Generated query',
  },
  {
    id: RESULTS_VIEW.HITS,
    label: 'Hits',
  },
  {
    id: RESULTS_VIEW.AGGREGATIONS,
    label: 'Aggregations',
  },
  {
    id: RESULTS_VIEW.RAW_RESPONSE,
    label: 'Raw response',
  },
];

function hasHits(searchResponse?: any): boolean {
  return Boolean(searchResponse?.hits?.hits?.length > 0);
}
function hasAggregations(searchResponse?: any): boolean {
  return Boolean(
    searchResponse?.aggregations &&
      Object.keys(searchResponse?.aggregations || {}).length > 0
  );
}

export function SearchResults(props: SearchResultsProps) {
  const generatedQuery = getGeneratedQueryFromResponse(props.searchResponse);
  const [selectedView, setSelectedView] = useState<RESULTS_VIEW>(
    RESULTS_VIEW.HITS
  );

  // Intelligently select the most appropriate tab based on search response content
  useEffect(() => {
    if (!props.searchResponse) return;
    if (hasHits(props.searchResponse)) {
      setSelectedView(RESULTS_VIEW.HITS);
    } else if (hasAggregations(props.searchResponse)) {
      setSelectedView(RESULTS_VIEW.AGGREGATIONS);
    } else {
      setSelectedView(RESULTS_VIEW.RAW_RESPONSE);
    }
  }, [props.searchResponse]);

  const handleViewChange = (viewId: string) => {
    setSelectedView(viewId as RESULTS_VIEW);
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          direction="row"
          gutterSize="none"
          alignItems="center"
          justifyContent="spaceBetween"
        >
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="none" alignItems="center">
              <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
                <EuiIcon type="documents" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTitle size="xs">
                  <h5>Search results</h5>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          {props.searchResponse && (
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty
                onClick={props.handleClear}
                iconType="eraser"
              >
                Clear results
              </EuiSmallButtonEmpty>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
      {props.searchResponse ? (
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              buttonSize="compressed"
              legend="Results View"
              options={RESULTS_VIEW_OPTIONS}
              idSelected={selectedView}
              onChange={handleViewChange}
              isFullWidth={false}
              style={{ width: '410px' }}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="xs" color="subdued" style={{ marginLeft: '4px' }}>
              <i>
                {props.searchResponse?.hits?.total?.value !== undefined && (
                  <span>{props.searchResponse.hits.total.value} documents</span>
                )}
              </i>
              <i>
                {props.searchResponse?.took !== undefined && (
                  <span> · {props.searchResponse.took}ms</span>
                )}
              </i>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            {selectedView === RESULTS_VIEW.HITS ? (
              <>
                {hasHits(props.searchResponse) ? (
                  <ResultsTable hits={props.searchResponse?.hits?.hits || []} />
                ) : (
                  <EuiText size="s">
                    <p>No documents found</p>
                  </EuiText>
                )}
              </>
            ) : selectedView === RESULTS_VIEW.GENERATED_QUERY ? (
              <>
                {generatedQuery !== undefined ? (
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    paddingSize="m"
                    isCopyable
                  >
                    {customStringify(generatedQuery)}
                  </EuiCodeBlock>
                ) : (
                  <EuiText size="s">
                    <p>
                      No agentic query translator processor results available
                    </p>
                  </EuiText>
                )}
              </>
            ) : selectedView === RESULTS_VIEW.AGGREGATIONS ? (
              <>
                {hasAggregations(props.searchResponse) ? (
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    paddingSize="m"
                    isCopyable
                  >
                    {customStringify(props.searchResponse.aggregations)}
                  </EuiCodeBlock>
                ) : (
                  <EuiText size="s">
                    <p>No aggregations found</p>
                  </EuiText>
                )}
              </>
            ) : (
              <>
                <EuiCodeBlock
                  language="json"
                  fontSize="s"
                  paddingSize="m"
                  isCopyable
                >
                  {customStringify(props.searchResponse)}
                </EuiCodeBlock>
              </>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <EuiEmptyPrompt
          iconType={'search'}
          title={<h4>Run a search to view results</h4>}
          titleSize="xs"
        />
      )}
    </EuiFlexGroup>
  );
}

//Util fn to extract the generated search query from the agentic_query_translator processor
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
