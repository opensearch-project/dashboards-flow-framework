/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { getIn } from 'formik';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiButtonGroup,
  EuiIcon,
  EuiTitle,
  EuiSmallButtonIcon,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { customStringify } from '../../../../../common';
import { ResultsTable } from '../../../../general_components';
import { AgentSummaryModal } from './agent_summary_modal';

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

function getResultsViewOptions(searchResponse?: any) {
  const options = [
    {
      id: RESULTS_VIEW.HITS,
      label: 'Hits',
    },
  ];

  if (hasAggregations(searchResponse)) {
    options.push({
      id: RESULTS_VIEW.AGGREGATIONS,
      label: 'Aggregations',
    });
  }

  options.push({
    id: RESULTS_VIEW.RAW_RESPONSE,
    label: 'Raw response',
  });

  return options;
}

function getButtonGroupWidth(searchResponse?: any): string {
  return hasAggregations(searchResponse) ? '275px' : '165px';
}

function hasHits(searchResponse?: any): boolean {
  return Boolean(searchResponse?.hits?.hits?.length > 0);
}
function hasAggregations(searchResponse?: any): boolean {
  return Boolean(
    searchResponse?.aggregations &&
      Object.keys(searchResponse?.aggregations || {}).length > 0
  );
}
function hasAgentSummary(searchResponse?: any): boolean {
  return !isEmpty(searchResponse?.ext?.agent_steps_summary);
}

export function SearchResults(props: SearchResultsProps) {
  const [selectedView, setSelectedView] = useState<RESULTS_VIEW>(
    RESULTS_VIEW.HITS
  );
  const [showResults, setShowResults] = useState<boolean>(true);

  const [showAgentSummaryModal, setShowAgentSummaryModal] = useState<boolean>(
    false
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
    <>
      {showAgentSummaryModal && (
        <AgentSummaryModal
          onClose={() => setShowAgentSummaryModal(false)}
          agentSummary={getIn(
            props,
            'searchResponse.ext.agent_steps_summary',
            ''
          )}
        />
      )}
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup
            direction="row"
            gutterSize="none"
            alignItems="center"
            justifyContent="spaceBetween"
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup
                direction="row"
                gutterSize="none"
                alignItems="center"
              >
                <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
                  <EuiIcon type="documents" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiTitle size="xs">
                    <h5 data-testid="searchResultsTitle">Search results</h5>
                  </EuiTitle>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            {props.searchResponse && (
              <EuiFlexItem grow={false}>
                <EuiSmallButtonIcon
                  aria-label="hideShowButton"
                  data-testid="hideShowResultsButton"
                  onClick={() => setShowResults(!showResults)}
                  iconType={showResults ? 'eye' : 'eyeClosed'}
                ></EuiSmallButtonIcon>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        {props.searchResponse && showResults && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiButtonGroup
                      buttonSize="compressed"
                      legend="Results View"
                      options={getResultsViewOptions(props.searchResponse)}
                      idSelected={selectedView}
                      onChange={handleViewChange}
                      isFullWidth={false}
                      style={{
                        width: getButtonGroupWidth(props.searchResponse),
                      }}
                      data-testid="resultsViewButtonGroup"
                    />
                  </EuiFlexItem>
                  {hasAgentSummary(props.searchResponse) && (
                    <EuiFlexItem grow={false}>
                      <EuiSmallButtonEmpty
                        iconType="generate"
                        onClick={() => setShowAgentSummaryModal(true)}
                      >
                        View agent summary
                      </EuiSmallButtonEmpty>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText
                  size="xs"
                  color="subdued"
                  style={{ marginLeft: '4px' }}
                >
                  <i>
                    {props.searchResponse?.hits?.total?.value !== undefined && (
                      <span>
                        {props.searchResponse.hits.total.value} documents
                      </span>
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
                      <div data-testid="resultsTableContainer">
                        <ResultsTable
                          hits={props.searchResponse?.hits?.hits || []}
                        />
                      </div>
                    ) : (
                      <EuiText size="s" data-testid="noDocumentsMessage">
                        No documents found
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
                        data-testid="aggregationsCodeBlock"
                      >
                        {customStringify(props.searchResponse.aggregations)}
                      </EuiCodeBlock>
                    ) : (
                      <EuiText size="s" data-testid="noAggregationsMessage">
                        No aggregations found
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
                      data-testid="rawResponseCodeBlock"
                    >
                      {customStringify(props.searchResponse)}
                    </EuiCodeBlock>
                  </>
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
