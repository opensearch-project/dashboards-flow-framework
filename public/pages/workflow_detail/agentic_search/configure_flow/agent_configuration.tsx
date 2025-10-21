/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { capitalize, cloneDeep, isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiToolTip,
  EuiIcon,
  EuiButtonGroup,
  EuiTitle,
  EuiSmallButton,
  EuiLoadingSpinner,
  EuiCallOut,
  EuiText,
  EuiLink,
  EuiSuperSelect,
  EuiEmptyPrompt,
} from '@elastic/eui';
import {
  Agent,
  AGENT_ID_PATH,
  AGENT_TYPE,
  AGENTIC_SEARCH_AGENTS_DOCS_LINK,
  AGENTIC_SEARCH_MCP_DOCS_LINK,
  customStringify,
  DEFAULT_AGENT,
  EMPTY_AGENT,
  MAX_DESCRIPTION_LENGTH,
  MAX_STRING_LENGTH,
  NEW_AGENT_ID_PLACEHOLDER,
  NEW_AGENT_PLACEHOLDER,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { sanitizeJSON } from '../../../../utils';
import { AgentTools } from './agent_tools';
import { SimplifiedJsonField } from '../components';
import { AgentLLMFields } from './agent_llm_fields';
import { AgentMCPServers } from './agent_mcp_servers';
import { AgentAdvancedSettings } from './agent_advanced_settings';

interface AgentConfigurationProps {
  uiConfig: WorkflowConfig | undefined;
  onCreateNew: () => void;
  newAndUnsaved: boolean;
  setNewAndUnsaved: (newAndUnsaved: boolean) => void;
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
  errorCreatingAgent: string;
  errorUpdatingAgent: string;
}

const AGENT_TYPE_OPTIONS = Object.values(AGENT_TYPE).map((agentType) => ({
  value: agentType,
  text: capitalize(agentType),
}));
enum CONFIG_MODE {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

/**
 * Configure agents. Select from existing agents, update existing agents, or create new agents altogether.
 */
export function AgentConfiguration(props: AgentConfigurationProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const { agents, loading } = useSelector((state: AppState) => state.ml);
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;

  const { id, ...agentFormNoId } = props.agentForm;
  const [configModeSelected, setConfigModeSelected] = useState<CONFIG_MODE>(
    CONFIG_MODE.SIMPLE
  );
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);

  const agentName = props.agentForm?.name || '';
  const agentDescription = props.agentForm?.description || '';

  // Fetch the agent type, and if not supported OOTB on the UI, still render appropriately for consistency.
  const agentType = (props.agentForm?.type || '').toLowerCase();
  const dynamicAgentTypeOptions = React.useMemo(() => {
    const knownOptions = AGENT_TYPE_OPTIONS;
    if (
      !agentType ||
      knownOptions.some((o) => o.value.toLowerCase() === agentType)
    ) {
      return knownOptions;
    } else {
      return [{ value: agentType, text: agentType }, ...knownOptions];
    }
  }, [AGENT_TYPE_OPTIONS, agentType]);

  // listen to agent ID changes. update the agent config form values appropriately
  useEffect(() => {
    const selectedAgentIdForm = getIn(values, AGENT_ID_PATH, '') as string;
    const agent = getIn(agents, selectedAgentIdForm, {});
    if (!isEmpty(selectedAgentIdForm) && !isEmpty(agent)) {
      props.setAgentForm(agent);
    } else if (selectedAgentIdForm === NEW_AGENT_PLACEHOLDER) {
      props.setAgentForm(DEFAULT_AGENT);
    } else {
      props.setAgentForm(EMPTY_AGENT);
    }
  }, [getIn(values, AGENT_ID_PATH), agents]);

  // get initial agent options for the dropdown
  const [agentOptions, setAgentOptions] = useState<any[]>([]);
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
        inputDisplay: agent.name,
        dropdownDisplay: (
          <>
            <EuiText size="s">
              {agent.name}
              {!isEmpty(agent.description) && (
                <EuiText size="xs" color="subdued">
                  <span
                    style={{
                      display: 'block',
                      width: '100%',
                      minWidth: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <i> {agent.description}</i>
                  </span>
                </EuiText>
              )}
            </EuiText>
          </>
        ),
      }))
    );
  }, [agents]);
  const noAgentsFound = isEmpty(agentOptions) && !loading;

  const handleModeSwitch = (queryMode: string) => {
    setConfigModeSelected(queryMode as CONFIG_MODE);
  };

  // update different agent options in the dropdown based on if a user is creating a new agent or not
  useEffect(() => {
    if (props.newAndUnsaved) {
      setFieldValue(AGENT_ID_PATH, NEW_AGENT_PLACEHOLDER);
      setFieldTouched(AGENT_ID_PATH, true);
      setAgentOptions((agentOptions) => [
        ...agentOptions,
        {
          value: NEW_AGENT_PLACEHOLDER,
          text: NEW_AGENT_ID_PLACEHOLDER,
          inputDisplay: NEW_AGENT_ID_PLACEHOLDER,
          dropdownDisplay: (
            <EuiText size="s">{NEW_AGENT_ID_PLACEHOLDER}</EuiText>
          ),
        },
      ]);
      // new and unsaved was triggered to false (either by user discarding the changes, or a new agent created).
      // either way, we want to remove the placeholder option in the dropdown.
    } else {
      setAgentOptions(
        agentOptions.filter((option) => option.value !== NEW_AGENT_PLACEHOLDER)
      );
    }
  }, [props.newAndUnsaved]);

  return (
    <>
      {loading ? (
        <EuiLoadingSpinner size="l" />
      ) : (
        <>
          <EuiFlexGroup
            direction="row"
            justifyContent="spaceBetween"
            alignItems="center"
            style={{ paddingLeft: '2px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup
                direction="row"
                gutterSize="none"
                alignItems="center"
              >
                <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
                  <EuiIcon type="generate" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiTitle size="xs">
                    <h5>Agent</h5>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content={
                      <p>
                        Choose or create an AI agent that will interpret your
                        natural language query and convert it to a search query.{' '}
                        <i>
                          For full advanced control, try out the JSON editor.
                        </i>
                      </p>
                    }
                  >
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
              <EuiFlexGroup direction="row" gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText size="s" color="subdued">
                    <EuiLink
                      target="_blank"
                      href={AGENTIC_SEARCH_AGENTS_DOCS_LINK}
                    >
                      Documentation
                    </EuiLink>
                  </EuiText>
                </EuiFlexItem>
                {!noAgentsFound && (
                  <EuiFlexItem grow={false}>
                    <EuiButtonGroup
                      buttonSize="compressed"
                      legend="Config Mode"
                      options={[
                        {
                          id: CONFIG_MODE.SIMPLE,
                          label: 'Form',
                        },
                        {
                          id: CONFIG_MODE.ADVANCED,
                          label: 'JSON',
                        },
                      ]}
                      idSelected={configModeSelected}
                      onChange={handleModeSwitch}
                      isFullWidth={false}
                      style={{ marginLeft: '8px' }}
                    />
                  </EuiFlexItem>
                )}
                {!props.newAndUnsaved && !noAgentsFound && (
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton
                      fill={false}
                      onClick={() => {
                        props.onCreateNew();
                      }}
                      iconType="plusInCircle"
                    >
                      Create new agent
                    </EuiSmallButton>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem>
              {noAgentsFound ? (
                <EuiEmptyPrompt
                  iconType={'generate'}
                  title={<h4>Create an agent to get started</h4>}
                  titleSize="xs"
                  actions={
                    <EuiSmallButton
                      fill={false}
                      onClick={() => {
                        props.onCreateNew();
                      }}
                      iconType="plusInCircle"
                    >
                      Create new agent
                    </EuiSmallButton>
                  }
                />
              ) : (
                <EuiSuperSelect
                  options={agentOptions}
                  valueOfSelected={selectedAgentId}
                  onChange={(value) => {
                    if (value !== NEW_AGENT_PLACEHOLDER) {
                      props.setNewAndUnsaved(false);
                    }
                    if (value) {
                      setFieldValue(AGENT_ID_PATH, value);
                      setFieldTouched(AGENT_ID_PATH, true);
                    }
                  }}
                  placeholder="Select an agent"
                  compressed
                  fullWidth
                />
              )}
            </EuiFlexItem>
            {(!isEmpty(props.errorCreatingAgent) ||
              !isEmpty(props.errorUpdatingAgent)) && (
              <EuiFlexItem grow={false}>
                <EuiCallOut
                  size="s"
                  color="danger"
                  iconType="alert"
                  title={`Error ${
                    !isEmpty(props.errorCreatingAgent) ? 'creating' : 'updating'
                  } agent`}
                >
                  <p>
                    {!isEmpty(props.errorCreatingAgent)
                      ? props.errorCreatingAgent
                      : props.errorUpdatingAgent}
                  </p>
                </EuiCallOut>
              </EuiFlexItem>
            )}
            {!isEmpty(selectedAgentId) && (
              <EuiFlexItem>
                {configModeSelected === CONFIG_MODE.SIMPLE ? (
                  <EuiFlexGroup direction="column" gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup direction="row" gutterSize="s">
                        <EuiFlexItem>
                          <EuiFormRow label="Name" fullWidth>
                            <EuiFieldText
                              value={agentName}
                              onChange={(e) =>
                                props.setAgentForm({
                                  ...props.agentForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter agent name"
                              aria-label="Enter agent name"
                              fullWidth
                              compressed
                              maxLength={MAX_STRING_LENGTH}
                            />
                          </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiFormRow label="Type" isInvalid={false} fullWidth>
                            <EuiSelect
                              options={dynamicAgentTypeOptions}
                              value={agentType}
                              onChange={(e) => {
                                const agentFormCopy = cloneDeep(
                                  props.agentForm
                                );
                                const proposedAgentType = e.target
                                  .value as AGENT_TYPE;

                                // remove invalid fields if switching to flow agent
                                if (proposedAgentType === AGENT_TYPE.FLOW) {
                                  delete agentFormCopy.llm;
                                  delete agentFormCopy.parameters
                                    ?._llm_interface;
                                  delete agentFormCopy.memory;
                                }

                                props.setAgentForm({
                                  ...agentFormCopy,
                                  type: proposedAgentType,
                                });
                              }}
                              aria-label="Agent type"
                              placeholder="Agent type"
                              fullWidth
                              compressed
                              hasNoInitialSelection={true}
                            />
                          </EuiFormRow>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiFormRow label="Description" fullWidth>
                        <EuiTextArea
                          value={agentDescription}
                          onChange={(e) =>
                            props.setAgentForm({
                              ...props.agentForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                          aria-label="Enter description"
                          rows={1}
                          fullWidth
                          compressed
                          maxLength={MAX_DESCRIPTION_LENGTH}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <AgentLLMFields
                        agentType={agentType as AGENT_TYPE}
                        agentForm={props.agentForm}
                        setAgentForm={props.setAgentForm}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiFormRow label="Tools" fullWidth>
                        <AgentTools
                          agentForm={props.agentForm}
                          setAgentForm={props.setAgentForm}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                    {agentType === AGENT_TYPE.CONVERSATIONAL && (
                      <EuiFlexItem grow={false}>
                        <EuiFormRow
                          label="MCP servers"
                          labelAppend={
                            <EuiText size="xs">
                              <EuiLink
                                href={AGENTIC_SEARCH_MCP_DOCS_LINK}
                                target="_blank"
                              >
                                Learn more
                              </EuiLink>
                            </EuiText>
                          }
                          fullWidth
                        >
                          <AgentMCPServers
                            agentForm={props.agentForm}
                            setAgentForm={props.setAgentForm}
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                    )}
                    <EuiFlexItem grow={false}>
                      <AgentAdvancedSettings
                        agentForm={props.agentForm}
                        setAgentForm={props.setAgentForm}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                ) : (
                  <SimplifiedJsonField
                    value={customStringify(agentFormNoId)}
                    onBlur={(e) => {
                      try {
                        const agentFormUpdated = JSON.parse(e);
                        const agentFormSanitized = sanitizeJSON(
                          agentFormUpdated
                        );
                        props.setAgentForm({
                          id: props.agentForm.id,
                          ...agentFormSanitized,
                        });
                        setJsonError(undefined);
                      } catch (error) {
                        setJsonError(
                          'Invalid JSON: ' + (error as Error)?.message || ''
                        );
                      }
                    }}
                    editorHeight="800px"
                    isInvalid={jsonError !== undefined}
                    helpText="Edit the full agent configuration directly"
                  />
                )}
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      )}
    </>
  );
}
