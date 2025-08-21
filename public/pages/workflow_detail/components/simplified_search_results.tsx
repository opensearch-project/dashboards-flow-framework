/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPanel, EuiText, EuiSpacer } from '@elastic/eui';

interface SimplifiedSearchResultsProps {
  searchResults: any | null;
}

export function SimplifiedSearchResults(props: SimplifiedSearchResultsProps) {
  const { searchResults } = props;

  return (
    <EuiPanel color="subdued" hasShadow={false} paddingSize="m">
      <EuiText size="s">
        <h4>Results</h4>
        <p>
          Found {searchResults?.hits?.total?.value || 'unknown number of'}{' '}
          documents in {searchResults?.took}ms
        </p>
      </EuiText>
      {searchResults.ext?.agent_search && (
        <>
          <EuiSpacer size="s" />
          <EuiText size="s">
            <h5>AI Response</h5>
            <p>{searchResults.ext.agent_search.response}</p>

            {searchResults.ext.agent_search.parsed_query && (
              <>
                <h5>Generated Query</h5>
                <pre>
                  {JSON.stringify(
                    searchResults.ext.agent_search.parsed_query,
                    null,
                    2
                  )}
                </pre>
              </>
            )}
          </EuiText>
        </>
      )}

      <EuiSpacer size="s" />
      {searchResults.hits?.hits?.length > 0 ? (
        <>
          <EuiText size="s">
            <h5>Documents</h5>
          </EuiText>
          {searchResults.hits.hits.map((hit: any, index: number) => (
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
                  {JSON.stringify(hit._source, null, 2)}
                </pre>
              </EuiText>
            </EuiPanel>
          ))}
        </>
      ) : (
        <EuiText size="s">
          <p>No documents found</p>
        </EuiText>
      )}
    </EuiPanel>
  );
}
