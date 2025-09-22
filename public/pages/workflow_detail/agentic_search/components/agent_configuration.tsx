/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isEmpty } from 'lodash';
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
  EuiAccordion,
  EuiText,
  EuiLink,
} from '@elastic/eui';
import {
  Agent,
  AGENT_MAIN_DOCS_LINK,
  AGENT_TYPE,
  customStringify,
  EMPTY_AGENT,
  NEW_AGENT_PLACEHOLDER,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { AgentTools } from './agent_tools';
import { SimplifiedJsonField } from './simplified_json_field';
import { AgentLLMFields } from './agent_llm_fields';
import { AgentParameters } from './agent_parameters';
import { AgentMemory } from './agent_memory';

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

const AGENT_ID_PATH = 'search.requestAgentId';
const AGENT_TYPE_OPTIONS = Object.values(AGENT_TYPE).map((agentType) => ({
  value: agentType,
  text:
    // custom name rendering for plan-execute-reflect agents
    agentType === AGENT_TYPE.PLAN_EXECUTE_REFLECT
      ? 'Plan-execute-reflect'
      : capitalize(agentType),
}));
/**
 * Enum for agent config toggle options
 */
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

  // Fetch the agent type, and if not supported OOTB on the UI, still render appropriately for consistency.
  const agentType = (props.agentForm?.type ?? '')?.toLowerCase();
  const agentTypeInvalid = isEmpty(agentType);
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
    const agent = agents[selectedAgentIdForm];
    if (!isEmpty(selectedAgentIdForm) && !isEmpty(agent)) {
      props.setAgentForm(agent);
    } else {
      props.setAgentForm(EMPTY_AGENT);
    }
  }, [getIn(values, AGENT_ID_PATH), agents]);

  // Populate the agent options in the dropdown on initial load
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
      }))
    );
  }, [agents]);

  // get initial agent options for the dropdown
  const [agentOptions, setAgentOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
      }))
    );
  }, [agents]);

  const handleModeSwitch = (queryMode: string) => {
    // TODO: we may need to handle more logic in the future as agent config fields grow, if we need further custom rendering etc.
    setConfigModeSelected(queryMode as CONFIG_MODE);
  };

  // update different agent options in the dropdown based on if a user is creating a new agent or not
  useEffect(() => {
    if (props.newAndUnsaved) {
      setFieldValue(AGENT_ID_PATH, NEW_AGENT_PLACEHOLDER);
      setFieldTouched(AGENT_ID_PATH, true);
      setAgentOptions([
        ...agentOptions,
        {
          value: NEW_AGENT_PLACEHOLDER,
          text: 'New agent (unsaved)',
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
                    <EuiLink target="_blank" href={AGENT_MAIN_DOCS_LINK}>
                      Documentation
                    </EuiLink>
                  </EuiText>
                </EuiFlexItem>
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
                {!props.newAndUnsaved && (
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
              <EuiSelect
                options={agentOptions}
                value={selectedAgentId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== NEW_AGENT_PLACEHOLDER) {
                    props.setNewAndUnsaved(false);
                  }
                  if (value) {
                    setFieldValue(AGENT_ID_PATH, value);
                    setFieldTouched(AGENT_ID_PATH, true);
                  }
                }}
                aria-label="Select agent"
                placeholder="Select an agent"
                hasNoInitialSelection={true}
                fullWidth
              />
            </EuiFlexItem>
            {(!isEmpty(props.errorCreatingAgent) ||
              !isEmpty(props.errorUpdatingAgent)) && (
              <EuiCallOut
                size="s"
                color="danger"
                iconType="alert"
                title={`Error ${
                  !isEmpty(props.errorCreatingAgent) ? 'creating' : 'updating'
                } agent`}
                style={{ marginBottom: '8px' }}
              >
                <p>
                  {!isEmpty(props.errorCreatingAgent)
                    ? props.errorCreatingAgent
                    : props.errorUpdatingAgent}
                </p>
              </EuiCallOut>
            )}
            {!isEmpty(selectedAgentId) && (
              <>
                <EuiFlexItem>
                  {configModeSelected === CONFIG_MODE.SIMPLE ? (
                    <EuiFlexGroup direction="row" gutterSize="s">
                      <EuiFlexItem>
                        <EuiFormRow label="Name" fullWidth>
                          <EuiFieldText
                            value={props.agentForm.name}
                            onChange={(e) =>
                              props.setAgentForm({
                                ...props.agentForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter agent name"
                            aria-label="Enter agent name"
                            fullWidth
                            maxLength={50}
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <EuiFormRow
                          label="Type"
                          isInvalid={agentTypeInvalid}
                          error={'No agent type configured'}
                          fullWidth
                        >
                          <EuiSelect
                            options={dynamicAgentTypeOptions}
                            value={agentTypeInvalid ? undefined : agentType}
                            onChange={(e) => {
                              props.setAgentForm({
                                ...props.agentForm,
                                type: e.target.value as AGENT_TYPE,
                              });
                            }}
                            aria-label="Agent type"
                            placeholder="Agent type"
                            fullWidth
                            isInvalid={agentTypeInvalid}
                            hasNoInitialSelection={true}
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ) : (
                    <SimplifiedJsonField
                      value={customStringify(agentFormNoId)}
                      onBlur={(e) => {
                        try {
                          const agentFormUpdated = JSON.parse(e);
                          props.setAgentForm({
                            id: props.agentForm.id,
                            ...agentFormUpdated,
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
                  <EuiSpacer size="m" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFormRow label="Description" fullWidth>
                    <EuiTextArea
                      value={props.agentForm.description}
                      onChange={(e) =>
                        props.setAgentForm({
                          ...props.agentForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                      aria-label="Enter description"
                      rows={2}
                      fullWidth
                      compressed
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                {/**
                 * For agent types that require and LLM for orchestration, provide custom form inputs for that.
                 */}
                {(agentType === AGENT_TYPE.CONVERSATIONAL ||
                  agentType === AGENT_TYPE.PLAN_EXECUTE_REFLECT) && (
                  <EuiFlexItem>
                    <EuiFormRow label="Large language model" fullWidth>
                      <AgentLLMFields
                        agentForm={props.agentForm}
                        setAgentForm={props.setAgentForm}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                )}
                <EuiFlexItem>
                  <EuiFormRow label="Tools" fullWidth>
                    <AgentTools
                      agentForm={props.agentForm}
                      setAgentForm={props.setAgentForm}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiAccordion
                    id="agentAdvancedSettings"
                    initialIsOpen={false}
                    buttonContent="Advanced settings"
                  >
                    <EuiSpacer size="s" />
                    {/**
                     * For agent types that allow for memory, provide custom form inputs for that.
                     */}
                    {(agentType === AGENT_TYPE.CONVERSATIONAL ||
                      agentType === AGENT_TYPE.PLAN_EXECUTE_REFLECT) && (
                      <EuiFlexItem>
                        <EuiFormRow label={'Memory (optional)'} fullWidth>
                          <AgentMemory
                            agentForm={props.agentForm}
                            setAgentForm={props.setAgentForm}
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                    )}
                    <EuiFlexItem>
                      <EuiFormRow label="Parameters" fullWidth>
                        <AgentParameters
                          agentForm={props.agentForm}
                          setAgentForm={props.setAgentForm}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                  </EuiAccordion>
                </EuiFlexItem>
              </>
            )}
          </EuiFlexGroup>
        </>
      )}
    </>
  );
}
