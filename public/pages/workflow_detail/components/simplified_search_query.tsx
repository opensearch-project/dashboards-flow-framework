/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
import {
  EuiFieldSearch,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButtonGroup,
  EuiCheckbox,
  EuiSpacer,
} from '@elastic/eui';
import { SimplifiedJsonField } from './simplified_json_field';
import { customStringify, WorkflowFormValues } from '../../../../common';

interface SimplifiedSearchQueryProps {}

/**
 * Enum for query mode toggle options
 */
enum QUERY_MODE {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export function SimplifiedSearchQuery(props: SimplifiedSearchQueryProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const agentId = getIn(values, 'search.agentId');
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();
  const [autoPipeline, setAutoPipeline] = useState<{}>({});
  const [customPipeline, setCustomPipeline] = useState<{}>({
    request_processors: [],
    phase_results_processors: [],
    response_processors: [],
  });
  const [queryModeSelected, setQueryModeSelected] = useState<QUERY_MODE>(
    QUERY_MODE.SIMPLE
  );
  const [simpleSearchQuery, setSimpleSearchQuery] = useState<string>(
    finalQuery?.query?.agentic?.query_text || ''
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [useAutoPipeline, setUseAutoPipeline] = useState<boolean>(true);

  useEffect(() => {
    setSimpleSearchQuery(finalQuery?.query?.agentic?.query_text || '');
  }, [finalQuery]);

  // update the auto-generated pipeline when a new agent is selected
  useEffect(() => {
    if (!isEmpty(agentId)) {
      setAutoPipeline({
        request_processors: [
          {
            agentic_query_translator: {
              agent_id: agentId,
            },
          },
        ],
      });
      // try to also update the agent ID if the user is building a custom pipeline
      if (
        !isEmpty(
          getIn(
            customPipeline,
            'request_processors.0.agentic_query_translator.agent_id',
            undefined
          )
        )
      ) {
        let customPipelineUpdated = cloneDeep(customPipeline);
        set(
          customPipelineUpdated,
          'request_processors.0.agentic_query_translator.agent_id',
          agentId
        );
        setCustomPipeline(customPipelineUpdated);
      }
    }
  }, [agentId]);

  // reset the custom pipeline to match the auto-generated one, whenever the checkmark is disabled
  useEffect(() => {
    if (!useAutoPipeline) {
      setCustomPipeline(autoPipeline);
    }
  }, [useAutoPipeline]);

  const handleModeSwitch = (queryMode: string) => {
    if (queryMode === QUERY_MODE.SIMPLE) {
      try {
        if (finalQuery?.query?.agentic?.query_text) {
          setSimpleSearchQuery(finalQuery.query.agentic.query_text);
        }
      } catch (error) {}
    }
    setQueryModeSelected(queryMode as QUERY_MODE);
  };

  const handleSimpleQueryChange = (e: any) => {
    const newQueryText = e.target.value;
    setSimpleSearchQuery(newQueryText);

    // Update the finalQuery in the parent by creating a new query with the updated text
    let updatedQuery = cloneDeep(finalQuery);
    if (updatedQuery?.query?.agentic?.query_text !== undefined) {
      updatedQuery.query.agentic.query_text = newQueryText;
      setFieldValue('search.request', customStringify(updatedQuery));
    }
  };

  const handleAdvancedQueryChange = (value: string) => {
    try {
      const parsedQuery = JSON.parse(value);
      setFieldValue('search.request', customStringify(parsedQuery));
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON: ' + (error as Error).message);
    }
  };

  const handleCustomPipelineChange = (value: string) => {
    try {
      const customPipelineObj = JSON.parse(value);
      setCustomPipeline(customPipelineObj);
    } catch (error) {}
  };

  return (
    <>
      <EuiFormRow
        label={
          <>
            Search Query
            <EuiToolTip content="Enter your question or query in natural language. The AI agent will convert it to an optimized search query">
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
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiSmallButtonGroup
              legend="Search Mode"
              options={[
                {
                  id: QUERY_MODE.SIMPLE,
                  label: 'Simple',
                },
                {
                  id: QUERY_MODE.ADVANCED,
                  label: 'Advanced',
                },
              ]}
              idSelected={queryModeSelected}
              onChange={handleModeSwitch}
              isFullWidth={false}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            {queryModeSelected === QUERY_MODE.ADVANCED ? (
              <>
                <SimplifiedJsonField
                  value={customStringify(finalQuery)}
                  onChange={handleAdvancedQueryChange}
                  editorHeight="200px"
                  isInvalid={!!jsonError}
                  helpText="Edit the full OpenSearch DSL query with agentic search parameters"
                />
                <EuiSpacer size="s" />
                <EuiCheckbox
                  id="useAutoPipelineCheckbox"
                  label="Use auto-generated search pipeline"
                  checked={useAutoPipeline}
                  onChange={() => setUseAutoPipeline(!useAutoPipeline)}
                />
                {!useAutoPipeline && (
                  <SimplifiedJsonField
                    value={customStringify(customPipeline)}
                    onChange={handleCustomPipelineChange}
                    editorHeight="200px"
                    isInvalid={!!jsonError}
                    helpText="Edit the default search pipeline to be used alongside the search query"
                  />
                )}
              </>
            ) : (
              <EuiFieldSearch
                placeholder="Enter your question or query here..."
                value={simpleSearchQuery}
                onChange={handleSimpleQueryChange}
                fullWidth
                isClearable
                aria-label="Enter search query"
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    </>
  );
}
