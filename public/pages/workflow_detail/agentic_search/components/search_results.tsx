/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiButtonGroup,
} from '@elastic/eui';
import { customStringify } from '../../../../../common';

interface SearchResultsProps {
  searchResponse?: any;
}

/**
 * Enum for results view tab options
 */
enum RESULTS_VIEW {
  GENERATED_QUERY = 'generated_pipeline',
  HITS = 'hits',
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
    id: RESULTS_VIEW.RAW_RESPONSE,
    label: 'Raw response',
  },
];

export function SearchResults(props: SearchResultsProps) {
  const generatedQuery = getGeneratedQueryFromResponse(props.searchResponse);
  const [selectedView, setSelectedView] = useState<RESULTS_VIEW>(
    RESULTS_VIEW.HITS
  );

  const handleViewChange = (viewId: string) => {
    setSelectedView(viewId as RESULTS_VIEW);
  };

  return (
    <EuiPanel color="subdued" hasShadow={false} paddingSize="m">
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup
            gutterSize="s"
            alignItems="center"
            justifyContent="spaceBetween"
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText size="s">
                    <h4>Results</h4>
                  </EuiText>
                </EuiFlexItem>
                {props.searchResponse && (
                  <EuiFlexItem>
                    <EuiText size="xs" color="subdued">
                      {props.searchResponse?.hits?.total?.value !==
                        undefined && (
                        <span>
                          {props.searchResponse.hits.total.value} documents
                        </span>
                      )}
                      {props.searchResponse?.took !== undefined && (
                        <span> · {props.searchResponse.took}ms</span>
                      )}
                    </EuiText>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                buttonSize="compressed"
                legend="Results View"
                options={RESULTS_VIEW_OPTIONS}
                idSelected={selectedView}
                onChange={handleViewChange}
                isFullWidth={false}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {selectedView === RESULTS_VIEW.HITS ? (
            <>
              {props.searchResponse?.hits?.hits?.length > 0 ? (
                <>
                  {props.searchResponse.hits.hits.map(
                    (hit: any, index: number) => (
                      <EuiPanel
                        key={index}
                        hasBorder
                        paddingSize="s"
                        style={{ marginTop: '8px' }}
                      >
                        <EuiText size="s">
                          <h6>Document {index + 1}</h6>
                          <p>
                            <strong>Score:</strong> {hit._score}
                          </p>
                          <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                            {customStringify(hit._source)}
                          </pre>
                        </EuiText>
                      </EuiPanel>
                    )
                  )}
                </>
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
                  <p>No agentic query translator processor results available</p>
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
    </EuiPanel>
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
