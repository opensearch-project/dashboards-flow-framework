/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
import {
  EuiToolTip,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButtonGroup,
  EuiTitle,
  EuiSmallButton,
  EuiTextArea,
  EuiSmallButtonEmpty,
  EuiIconTip,
  EuiText,
  EuiLink,
  EuiCode,
} from '@elastic/eui';
import { SimplifiedJsonField } from '../components';
import { QueryFieldSelector } from './query_field_selector';
import {
  customStringify,
  WorkflowFormValues,
  WorkflowConfig,
  IndexMappings,
  AGENT_ID_PATH,
  PROCESSOR_TYPE,
  AGENTIC_QUERY_DSL_DOCS_LINK,
  AGENT_TYPE,
} from '../../../../../common';

interface SearchQueryProps {
  setSearchPipeline: (searchPipeline: {}) => void;
  uiConfig?: WorkflowConfig;
  fieldMappings: IndexMappings | undefined;
  handleSearch(): void;
  handleStop(): void;
  isSearching: boolean;
  agentType?: AGENT_TYPE;
  memoryId?: string;
}

/**
 * Enum for query mode toggle options
 */
enum QUERY_MODE {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export const QUERY_PLACEHOLDER_CONTENT = 'Enter your question or query here...';

const CLEAR_MEMORY_TOOLTIP_CONTENT =
  'Remove the memory ID associated with the query. No conversational history will be passed to the agent.';

const CONTINUE_CONVERSATION_TOOLTIP_CONTENT =
  'Add the recent memory ID into the query to pass conversational history to the agent.';

const STOP_SEARCH_TOOLTIP_CONTENT =
  'Stop the current search and run a new one. Note the current search may still run in the background.';

export function SearchQuery(props: SearchQueryProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();
  const [autoPipeline, setAutoPipeline] = useState<{}>({
    request_processors: [
      {
        [PROCESSOR_TYPE.AGENTIC_QUERY_TRANSLATOR]: {
          agent_id: '',
        },
      },
    ],
    response_processors: [
      {
        [PROCESSOR_TYPE.AGENTIC_CONTEXT]: {
          agent_steps_summary: true,
          dsl_query: true,
        },
      },
    ],
  });
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
    if (!isEmpty(selectedAgentId)) {
      setAutoPipeline({
        request_processors: [
          {
            [PROCESSOR_TYPE.AGENTIC_QUERY_TRANSLATOR]: {
              agent_id: selectedAgentId,
            },
          },
        ],
        response_processors: [
          {
            [PROCESSOR_TYPE.AGENTIC_CONTEXT]: {
              agent_steps_summary: true,
              dsl_query: true,
            },
          },
        ],
      });
      // try to also update the agent ID if the user is building a custom pipeline
      if (
        !isEmpty(
          getIn(
            customPipeline,
            `request_processors.0.${PROCESSOR_TYPE.AGENTIC_QUERY_TRANSLATOR}.agent_id`,
            undefined
          )
        )
      ) {
        let customPipelineUpdated = cloneDeep(customPipeline);
        set(
          customPipelineUpdated,
          `request_processors.0.${PROCESSOR_TYPE.AGENTIC_QUERY_TRANSLATOR}.agent_id`,
          selectedAgentId
        );
        setCustomPipeline(customPipelineUpdated);
      }
    }
  }, [selectedAgentId]);

  // reset the custom pipeline to match the auto-generated one, whenever the checkmark is disabled.
  // always reset the upstream persisted search pipeline when either are toggled, back to the default
  useEffect(() => {
    if (useAutoPipeline) {
      props.setSearchPipeline(autoPipeline);
    } else {
      props.setSearchPipeline(autoPipeline);
      setCustomPipeline(autoPipeline);
    }
  }, [useAutoPipeline]);

  useEffect(() => {
    if (useAutoPipeline) {
      props.setSearchPipeline(autoPipeline);
    } else {
      props.setSearchPipeline(customPipeline);
    }
  }, [autoPipeline, customPipeline]);

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
      setJsonError('Invalid JSON: ' + (error as Error)?.message || '');
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
      <EuiFlexGroup
        direction="row"
        justifyContent="spaceBetween"
        alignItems="center"
        style={{ paddingLeft: '2px' }}
      >
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" gutterSize="none" alignItems="center">
            <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
              <EuiIcon type="search" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h5>Query</h5>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Enter your question or query in natural language. The AI agent will convert it to an optimized search query.">
                <EuiIcon
                  type="questionInCircle"
                  color="subdued"
                  style={{ marginLeft: '4px' }}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" gutterSize="s">
            {/**
             * If there is an existing memory ID found, show a button to let
             * users easily remove it from the query DSL.
             */}
            {!isEmpty(finalQuery?.query?.agentic?.memory_id ?? '') && (
              <EuiFlexItem grow={false}>
                <EuiFlexGroup
                  direction="row"
                  alignItems="center"
                  gutterSize="none"
                >
                  <EuiFlexItem grow={false}>
                    <EuiSmallButtonEmpty
                      iconSide="left"
                      iconSize="s"
                      iconType={'cross'}
                      onClick={() => {
                        let updatedQuery = cloneDeep(finalQuery);
                        if (
                          updatedQuery?.query?.agentic?.memory_id !== undefined
                        ) {
                          delete updatedQuery.query.agentic.memory_id;
                          setFieldValue(
                            'search.request',
                            customStringify(updatedQuery)
                          );
                        }
                      }}
                      disabled={props.isSearching}
                    >
                      Clear conversation
                    </EuiSmallButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiIconTip
                      content={CLEAR_MEMORY_TOOLTIP_CONTENT}
                      position="top"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            )}
            {/**
             * If there is a new memory ID found, show a button to let users
             * easily inject it into the query DSL.
             */}
            {props.agentType === AGENT_TYPE.CONVERSATIONAL &&
              isEmpty(finalQuery?.query?.agentic?.memory_id ?? '') &&
              !isEmpty(props.memoryId) &&
              (finalQuery?.query?.agentic?.memory_id ?? '') !==
                props.memoryId && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup
                    direction="row"
                    alignItems="center"
                    gutterSize="none"
                  >
                    <EuiFlexItem grow={false}>
                      <EuiSmallButtonEmpty
                        iconSide="left"
                        iconType={'chatLeft'}
                        iconSize="s"
                        onClick={() => {
                          let updatedQuery = cloneDeep(finalQuery ?? {});
                          set(
                            updatedQuery,
                            'query.agentic.memory_id',
                            props.memoryId
                          );
                          setFieldValue(
                            'search.request',
                            customStringify(updatedQuery)
                          );
                        }}
                        disabled={props.isSearching}
                      >
                        Continue conversation
                      </EuiSmallButtonEmpty>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiIconTip
                        content={CONTINUE_CONVERSATION_TOOLTIP_CONTENT}
                        position="top"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                buttonSize="compressed"
                legend="Config Mode"
                options={[
                  {
                    id: QUERY_MODE.SIMPLE,
                    label: 'Form',
                  },
                  {
                    id: QUERY_MODE.ADVANCED,
                    label: 'JSON',
                  },
                ]}
                idSelected={queryModeSelected}
                onChange={handleModeSwitch}
                isFullWidth={false}
                style={{ marginLeft: '8px' }}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              {props.isSearching ? (
                <EuiToolTip
                  content={STOP_SEARCH_TOOLTIP_CONTENT}
                  position="bottom"
                >
                  <EuiSmallButton
                    onClick={props.handleStop}
                    color="danger"
                    iconType="stop"
                  >
                    Stop
                  </EuiSmallButton>
                </EuiToolTip>
              ) : (
                <EuiSmallButton
                  onClick={props.handleSearch}
                  fill={false}
                  iconType="search"
                >
                  Search
                </EuiSmallButton>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>
          {queryModeSelected === QUERY_MODE.ADVANCED ? (
            <>
              <SimplifiedJsonField
                value={customStringify(finalQuery)}
                onBlur={handleAdvancedQueryChange}
                editorHeight="200px"
                isInvalid={!!jsonError}
                helpText={
                  <EuiText size="xs">
                    For more information on configuring
                    <EuiCode transparentBackground>agentic</EuiCode>queries,
                    check out the{' '}
                    <EuiLink
                      href={AGENTIC_QUERY_DSL_DOCS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      documentation
                    </EuiLink>
                  </EuiText>
                }
              />
            </>
          ) : (
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem>
                <EuiTextArea
                  placeholder={QUERY_PLACEHOLDER_CONTENT}
                  aria-label="Enter search query"
                  value={simpleSearchQuery}
                  onChange={handleSimpleQueryChange}
                  compressed
                  fullWidth
                  rows={2}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <QueryFieldSelector
                  uiConfig={props.uiConfig}
                  fieldMappings={props.fieldMappings}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
          {/**
           * TODO: in the future, may expose this again to allow users more flexibility
           * for explicit pipeline creation
           */}
          {/* <EuiFlexItem grow={false} style={{ marginLeft: '2px' }}>
            <EuiCheckbox
              compressed
              id="useAutoPipelineCheckbox"
              label={
                <EuiText size="xs" color="subdued">
                  Use auto-generated search pipeline
                </EuiText>
              }
              checked={useAutoPipeline}
              onChange={() => setUseAutoPipeline(!useAutoPipeline)}
            />
          </EuiFlexItem>
          {!useAutoPipeline && (
            <SimplifiedJsonField
              value={customStringify(customPipeline)}
              onBlur={handleCustomPipelineChange}
              editorHeight="200px"
              isInvalid={!!jsonError}
              helpText="Edit the default search pipeline to be used alongside the search query"
            />
          )} */}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
