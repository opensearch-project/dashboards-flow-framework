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
import { VisualizedHits } from './visualized_hits';

interface SearchResultsProps {
  searchResponse?: any;
}

/**
 * Enum for results view tab options
 */
enum RESULTS_VIEW {
  VISUAL_HITS = 'visual_hits',
  GENERATED_QUERY = 'generated_pipeline',
  HITS = 'hits',
  AGGREGATIONS = 'aggregations',
  RAW_RESPONSE = 'raw_response',
}

const NUM_FIELDS_TO_CHECK_FOR_IMAGES = 5;

function getResultsViewOptions(searchResponse?: any) {
  const options = [];

  if (hasImages(searchResponse)) {
    options.push({
      id: RESULTS_VIEW.VISUAL_HITS,
      label: 'Visual',
      'data-testid': 'visualButton',
    });
  }

  if (hasHits(searchResponse)) {
    options.push({
      id: RESULTS_VIEW.HITS,
      label: 'Hits',
      'data-testid': 'hitsButton',
    });
  }

  if (hasAggregations(searchResponse)) {
    options.push({
      id: RESULTS_VIEW.AGGREGATIONS,
      label: 'Aggregations',
      'data-testid': 'aggregationsButton',
    });
  }

  options.push({
    id: RESULTS_VIEW.RAW_RESPONSE,
    label: 'Raw response',
    'data-testid': 'rawResponseButton',
  });

  return options;
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
function hasImageField(hit: any): string | undefined {
  const source = hit._source || {};
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.tiff',
    '.ico',
  ];

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (imageExtensions.some((ext) => lowerValue.endsWith(ext))) {
        return key;
      }
    }
  }
  return undefined;
}
function hasImages(searchResponse?: any): boolean {
  if (!hasHits(searchResponse)) return false;
  const hits = searchResponse?.hits?.hits || [];
  const firstHits = hits.slice(0, NUM_FIELDS_TO_CHECK_FOR_IMAGES);
  return firstHits.some((hit: any) => hasImageField(hit) !== undefined);
}
function getImageFieldName(searchResponse?: any): string | undefined {
  if (!hasHits(searchResponse)) return undefined;
  const hits = searchResponse?.hits?.hits || [];
  const firstHits = hits.slice(0, NUM_FIELDS_TO_CHECK_FOR_IMAGES);
  for (const hit of firstHits) {
    const fieldName = hasImageField(hit);
    if (fieldName) return fieldName;
  }
  return undefined;
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
      if (hasImages(props.searchResponse)) {
        setSelectedView(RESULTS_VIEW.VISUAL_HITS);
      } else {
        setSelectedView(RESULTS_VIEW.HITS);
      }
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
                {selectedView === RESULTS_VIEW.VISUAL_HITS ? (
                  <VisualizedHits
                    hits={props.searchResponse?.hits?.hits || []}
                    imageFieldName={
                      getImageFieldName(props.searchResponse) as string
                    }
                  />
                ) : selectedView === RESULTS_VIEW.HITS ? (
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
