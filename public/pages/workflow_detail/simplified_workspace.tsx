/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState, searchIndex, useAppDispatch } from '../../store';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiText,
  EuiSmallButton,
  EuiBetaBadge,
  EuiSpacer,
  EuiCallOut,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import { Workflow, WorkflowConfig } from '../../../common';
import { getDataSourceId } from '../../utils/utils';
import { SimplifiedAgentSelector } from './components/simplified_agent_selector';
import { SimplifiedSearchQuery } from './components/simplified_search_query';
import { SimplifiedIndexSelector } from './components/simplified_index_selector';
import { SimplifiedSearchResults } from './components/simplified_search_results';

// styling
import '../../global-styles.scss';

interface SimplifiedWorkspaceProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig | undefined;
  setBlockNavigation: (blockNavigation: boolean) => void; // TODO: block if unsaved changes.
}

/**
 * Simplified workspace component for the Agentic Search (Simplified) workflow type.
 * This component provides a streamlined UI with just a search bar and two dropdowns.
 */
// Constant for consistent form widths
const FORM_WIDTH = '750px';

export function SimplifiedWorkspace(props: SimplifiedWorkspaceProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const [selectedIndexId, setSelectedIndexId] = useState<string | undefined>(
    undefined
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
    undefined
  );
  const [finalQuery, setFinalQuery] = useState<{}>({
    query: {
      agentic: {
        query_text: '',
        agent_id: '',
        query_fields: [],
      },
    },
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the loading and error states from Redux
  const {
    loading: opensearchLoading,
    errorMessage: opensearchError,
  } = useSelector((state: AppState) => state.opensearch);

  const { loading: mlLoading } = useSelector((state: AppState) => state.ml);

  useEffect(() => {
    if (opensearchError) {
      setError(opensearchError);
    }
  }, [opensearchError]);

  // Update finalQuery when agent changes (and if the agent_id key exists)
  useEffect(() => {
    if (finalQuery?.query?.agentic?.agent_id !== undefined) {
      setFinalQuery((prevQuery) => ({
        ...prevQuery,
        query: {
          ...prevQuery?.query,
          agentic: {
            ...prevQuery?.query?.agentic,
            agent_id: selectedAgentId || '',
          },
        },
      }));
    }
  }, [selectedAgentId]);

  const handleClear = () => {
    setSearchResults(null);
    setError(null);
  };

  const handleSearch = () => {
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
    setError(null);

    dispatch(
      searchIndex({
        apiBody: {
          index: selectedIndexId,
          body: finalQuery,
        },
        dataSourceId,
      })
    )
      .unwrap()
      .then((response) => {
        setIsSearching(false);
        setSearchResults(response);
      })
      .catch((error) => {
        setIsSearching(false);
        setError(`Search failed: ${error}`);
      });
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
      <EuiFlexGroup direction="column" gutterSize="m">
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
              you. Ask questions in plain English, and the AI agent will convert
              them into optimized search queries to find relevant results.
            </p>
            <p>
              <strong>Example questions:</strong>
              <ul>
                <li>
                  "What's the average CPU usage across my servers last week?"
                </li>
                <li>"Find documents about machine learning in healthcare"</li>
                <li>
                  "Show me the most recent customer complaints about shipping
                  delays"
                </li>
              </ul>
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
        <EuiFlexItem grow={false} style={{ maxWidth: FORM_WIDTH }}>
          <SimplifiedIndexSelector
            selectedIndexId={selectedIndexId}
            onIndexSelected={(indexId) => setSelectedIndexId(indexId)}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: FORM_WIDTH }}>
          <EuiFormRow
            label={
              <>
                Agent
                <EuiToolTip content="Select or create an AI agent that will interpret your natural language query and convert it to a search query">
                  <EuiIcon
                    type="questionInCircle"
                    color="subdued"
                    style={{ marginLeft: '4px' }}
                  />
                </EuiToolTip>
              </>
            }
            fullWidth
          >
            <SimplifiedAgentSelector
              selectedAgentId={selectedAgentId}
              onAgentSelected={(agentId) => setSelectedAgentId(agentId)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <SimplifiedSearchQuery
            finalQuery={finalQuery}
            onFinalQueryChange={(query) => setFinalQuery(query)}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
            {searchResults && (
              <EuiFlexItem grow={false}>
                <EuiToolTip content="Clear search results and form">
                  <EuiSmallButton onClick={handleClear} iconType="eraser">
                    Clear
                  </EuiSmallButton>
                </EuiToolTip>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiToolTip
                content={
                  !finalQuery?.query?.agentic?.query_text ||
                  !selectedIndexId ||
                  !selectedAgentId ||
                  mlLoading
                    ? 'Select an index and agent, and enter a search query'
                    : 'Search using AI agent'
                }
              >
                <EuiSmallButton
                  onClick={handleSearch}
                  fill
                  iconType="search"
                  isLoading={isSearching || opensearchLoading}
                  isDisabled={
                    !finalQuery?.query?.agentic?.query_text ||
                    !selectedIndexId ||
                    !selectedAgentId ||
                    mlLoading
                  }
                >
                  Search
                </EuiSmallButton>
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <SimplifiedSearchResults
            searchResults={searchResults}
            isLoading={isSearching || opensearchLoading}
          />
        </EuiFlexItem>
        <EuiFlexItem />
      </EuiFlexGroup>
    </EuiPanel>
  );
}
