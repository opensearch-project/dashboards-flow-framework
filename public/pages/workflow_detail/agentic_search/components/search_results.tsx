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
  EuiSmallButtonIcon,
} from '@elastic/eui';
import { customStringify } from '../../../../../common';
import { ResultsTable } from '../../../../general_components/';

interface SearchResultsProps {
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
  const [selectedView, setSelectedView] = useState<RESULTS_VIEW>(
    RESULTS_VIEW.HITS
  );
  const [showResults, setShowResults] = useState<boolean>(true);

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
              <EuiSmallButtonIcon
                aria-label="hideShowButton"
                onClick={() => setShowResults(!showResults)}
                iconType={showResults ? 'eye' : 'eyeClosed'}
              ></EuiSmallButtonIcon>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
      {props.searchResponse && showResults && (
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              buttonSize="compressed"
              legend="Results View"
              options={RESULTS_VIEW_OPTIONS}
              idSelected={selectedView}
              onChange={handleViewChange}
              isFullWidth={false}
              style={{ width: '275px' }}
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
      )}
    </EuiFlexGroup>
  );
}
