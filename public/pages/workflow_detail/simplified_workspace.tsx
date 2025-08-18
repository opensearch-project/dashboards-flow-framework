/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldSearch,
  EuiSelect,
  EuiText,
  EuiSmallButton,
  EuiBetaBadge,
  EuiSpacer,
  EuiCallOut,
} from '@elastic/eui';
import { AppState, searchAgents, useAppDispatch } from '../../store';
import {
  FETCH_ALL_QUERY_LARGE,
  Workflow,
  WorkflowConfig,
} from '../../../common';
import { getDataSourceId } from '../../utils/utils';

// styling
import '../../global-styles.scss';

interface SimplifiedWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setBlockNavigation: (blockNavigation: boolean) => void;
}

/**
 * Simplified workspace component for the Agentic Search (Simplified) workflow type.
 * This component provides a streamlined UI with just a search bar and two dropdowns.
 */
export function SimplifiedWorkspace(props: SimplifiedWorkspaceProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndexId, setSelectedIndexId] = useState<string | undefined>(
    undefined
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
    undefined
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { indices } = useSelector((state: AppState) => state.opensearch);
  const { agents } = useSelector((state: AppState) => state.ml);

  // Fetch all agents on initial load
  useEffect(() => {
    dispatch(searchAgents({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
  }, []);

  const indexOptions = Object.values(indices || {}).map((index) => ({
    value: index.name,
    text: index.name,
  }));
  const agentOptions = Object.values(agents || {}).map((agent) => ({
    value: agent.id,
    text: agent.name,
  }));

  const handleSearch = () => {
    // Validate that all required fields are selected
    if (!searchQuery) {
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
    setError(null);

    // Here you would integrate with the actual search API
    // For now we'll just simulate a search
    setTimeout(() => {
      setIsSearching(false);
      // Mock results for demonstration
      setSearchResults({
        took: 42,
        hits: {
          total: { value: 3 },
          hits: [
            { _source: { title: 'Sample document 1' } },
            { _source: { title: 'Sample document 2' } },
            { _source: { title: 'Sample document 3' } },
          ],
        },
      });
    }, 1000);

    // Notify parent component of state changes
    props.setBlockNavigation(false);
  };

  return (
    <EuiPanel
      paddingSize="l"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <EuiFlexGroup direction="column" gutterSize="l">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="xs" alignItems="center">
            <EuiFlexItem>
              <EuiText size="m">
                <h2>Simplified Agentic Search</h2>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBetaBadge
                label="Experimental"
                tooltipContent="This feature is experimental and may change in future releases"
                size="s"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiText size="s" color="subdued">
            <p>
              Enter a natural language query and let AI do the searching for
              you.
            </p>
          </EuiText>
          <EuiSpacer size="m" />
        </EuiFlexItem>

        {error && (
          <EuiFlexItem grow={false}>
            <EuiCallOut title="Error" color="danger" iconType="alert">
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={false} style={{ width: '300px' }}>
              <EuiFormRow label="Select Index">
                <EuiSelect
                  options={indexOptions}
                  value={selectedIndexId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedIndexId(value || undefined);
                  }}
                  aria-label="Select index"
                  placeholder="Select an index"
                  hasNoInitialSelection={true}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem
              grow={false}
              style={{ width: '300px', marginLeft: '16px' }}
            >
              <EuiFormRow label="Select Agent">
                <EuiSelect
                  options={agentOptions}
                  value={selectedAgentId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedAgentId(value || undefined);
                  }}
                  aria-label="Select agent"
                  placeholder="Select an agent"
                  hasNoInitialSelection={true}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFormRow label="Search Query" fullWidth>
            <EuiFieldSearch
              placeholder="Enter your question or query here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              isClearable
              aria-label="Enter search query"
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                onClick={handleSearch}
                fill
                iconType="search"
                isLoading={isSearching}
                isDisabled={
                  !searchQuery || !selectedIndexId || !selectedAgentId
                }
              >
                Search
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        {searchResults && (
          <EuiFlexItem>
            <EuiPanel color="subdued" hasShadow={false} paddingSize="m">
              <EuiText size="s">
                <h4>Results</h4>
                <p>Found {searchResults.hits.total.value} documents</p>
                <ul>
                  {searchResults.hits.hits.map((hit: any, index: number) => (
                    <li key={index}>{hit._source.title}</li>
                  ))}
                </ul>
              </EuiText>
            </EuiPanel>
          </EuiFlexItem>
        )}
        <EuiFlexItem />
      </EuiFlexGroup>
    </EuiPanel>
  );
}
