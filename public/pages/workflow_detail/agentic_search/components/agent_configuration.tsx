/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiAccordion,
  EuiToolTip,
  EuiIcon,
  EuiButtonEmpty,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiText,
  EuiButtonGroup,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  customStringify,
  FETCH_ALL_QUERY_LARGE,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  AppState,
  registerAgent,
  updateAgent,
  searchAgents,
  useAppDispatch,
} from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { capitalize, isEmpty, isEqual } from 'lodash';
import { AgentTools } from './agent_tools';
import { SimplifiedJsonField } from './simplified_json_field';

interface AgentConfigurationProps {
  uiConfig: WorkflowConfig | undefined;
}

const AGENT_ID_PATH = 'search.requestAgentId';
const NEW_AGENT_PLACEHOLDER = 'new_agent';
const EMPTY_AGENT = {
  type: AGENT_TYPE.FLOW,
  name: 'my_agent',
  description: '',
  tools: [],
};
const AGENT_TYPE_OPTIONS = Object.values(AGENT_TYPE).map((agentType) => ({
  value: agentType,
  text: capitalize(agentType),
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
  // These will be used later when implementing save functionality
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const { agents } = useSelector((state: AppState) => state.ml);
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;

  const [agentForm, setAgentForm] = useState<Partial<Agent>>(EMPTY_AGENT);
  const { id, ...agentFormNoId } = agentForm;
  const [configModeSelected, setConfigModeSelected] = useState<CONFIG_MODE>(
    CONFIG_MODE.SIMPLE
  );
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const selectedAgentIdForm = getIn(values, AGENT_ID_PATH, '') as string;
    const agent = agents[selectedAgentIdForm];
    if (!isEmpty(selectedAgentIdForm) && !isEmpty(agent)) {
      setAgentForm(agent);
    } else {
      setAgentForm(EMPTY_AGENT);
    }
  }, [getIn(values, AGENT_ID_PATH), agents]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [newAndUnsaved, setNewAndUnsaved] = useState<boolean>(false);
  const existingAndUnsaved =
    selectedAgentId !== NEW_AGENT_PLACEHOLDER &&
    !isEqual(getIn(agents, selectedAgentId, {}), agentForm);
  const [agentOptions, setAgentOptions] = useState<
    { value: string; text: string }[]
  >([]);
  const agentTypeInvalid = !Object.values(AGENT_TYPE).includes(
    agentForm.type as AGENT_TYPE
  );

  const handleModeSwitch = (queryMode: string) => {
    // TODO: we may need to handle more logic in the future as agent config fields grow, if we need further custom rendering etc.
    setConfigModeSelected(queryMode as CONFIG_MODE);
  };

  // Fetch agents (and populate the agent options in the dropdown) on initial load
  useEffect(() => {
    dispatch(searchAgents({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
  }, []);
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
      }))
    );
  }, [agents]);

  // open the accordion, and add a placeholder "New agent (unsaved)" option in the dropdown.
  function onCreateNew() {
    setIsAccordionOpen(true);
    setNewAndUnsaved(true);
  }
  useEffect(() => {
    if (newAndUnsaved) {
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
  }, [newAndUnsaved]);

  function onDiscardDraft() {
    setNewAndUnsaved(false);
    setFieldValue(
      AGENT_ID_PATH,
      props.uiConfig?.search?.requestAgentId?.value || undefined
    );
  }

  function onRevertChanges() {
    const agent = getIn(agents, selectedAgentId, {});
    if (!isEmpty(agent)) {
      setAgentForm(agent);
    } else {
      setAgentForm(EMPTY_AGENT);
    }
  }

  async function onCreateAgent() {
    setIsSaving(true);
    try {
      const response = await dispatch(
        registerAgent({
          apiBody: agentForm,
          dataSourceId,
        })
      ).unwrap();
      if (response && response.agent && response.agent.id) {
        setFieldValue(AGENT_ID_PATH, response.agent.id);
      } else {
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
      setNewAndUnsaved(false);
    }
  }

  async function onUpdateAgent() {
    setIsSaving(true);
    try {
      await dispatch(
        updateAgent({
          agentId: selectedAgentId,
          body: agentForm,
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp) => {})
        .catch((e) => {
          // console.error(e);
        });
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EuiPanel color="subdued" hasShadow={false} paddingSize="s">
      <EuiFormRow
        label={
          <>
            Agent
            <EuiToolTip content="Choose an AI agent that will interpret your natural language query and convert it to a search query">
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
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="s" alignItems="center">
              <EuiFlexItem>
                <EuiSelect
                  options={agentOptions}
                  value={selectedAgentId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== NEW_AGENT_PLACEHOLDER) {
                      setNewAndUnsaved(false);
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
              {!newAndUnsaved && (
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    size="s"
                    onClick={onCreateNew}
                    iconType="plusInCircle"
                  >
                    Create new
                  </EuiButtonEmpty>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiAccordion
              id="agentConfigAccordion"
              buttonContent={<EuiText size="s">Details</EuiText>}
              paddingSize="s"
              initialIsOpen={false}
              onToggle={(isOpen) => setIsAccordionOpen(isOpen)}
              data-test-subj="agentConfigAccordion"
              forceState={isAccordionOpen ? 'open' : 'closed'}
            >
              <EuiSpacer size="s" />
              {configModeSelected === CONFIG_MODE.SIMPLE ? (
                <>
                  <EuiFormRow label="Name">
                    <EuiFieldText
                      value={agentForm.name}
                      onChange={(e) =>
                        setAgentForm({ ...agentForm, name: e.target.value })
                      }
                      placeholder="Enter agent name"
                      aria-label="Enter agent name"
                      fullWidth
                    />
                  </EuiFormRow>
                  <EuiFormRow
                    label="Type"
                    isInvalid={agentTypeInvalid}
                    error={`Unknown agent type: '${agentForm?.type}'`}
                  >
                    <EuiSelect
                      options={AGENT_TYPE_OPTIONS}
                      value={agentTypeInvalid ? undefined : agentForm?.type}
                      onChange={(e) => {
                        setAgentForm({
                          ...agentForm,
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
                  <EuiSpacer size="s" />
                  <EuiFormRow label="Description">
                    <EuiTextArea
                      value={agentForm.description}
                      onChange={(e) =>
                        setAgentForm({
                          ...agentForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                      aria-label="Enter description"
                      rows={3}
                      fullWidth
                      compressed
                    />
                  </EuiFormRow>
                  <EuiSpacer size="s" />
                  <EuiFormRow label="Tools">
                    <AgentTools
                      agentForm={agentForm}
                      setAgentForm={setAgentForm}
                    />
                  </EuiFormRow>
                </>
              ) : (
                <SimplifiedJsonField
                  value={customStringify(agentFormNoId)}
                  onBlur={(e) => {
                    try {
                      const agentFormUpdated = JSON.parse(e);
                      setAgentForm({
                        id: agentForm.id,
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
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiSmallButton
                    onClick={() => {
                      if (newAndUnsaved) {
                        onCreateAgent();
                      } else {
                        onUpdateAgent();
                      }
                    }}
                    fill
                    isDisabled={
                      isEqual(getIn(agents, selectedAgentId, {}), agentForm) ||
                      !agentForm?.name?.trim()
                    }
                    isLoading={isSaving}
                  >
                    Save
                  </EuiSmallButton>
                </EuiFlexItem>
                {existingAndUnsaved && (
                  <EuiFlexItem grow={false}>
                    <EuiSmallButtonEmpty onClick={onRevertChanges}>
                      Discard changes
                    </EuiSmallButtonEmpty>
                  </EuiFlexItem>
                )}

                {newAndUnsaved && (
                  <EuiFlexItem grow={false}>
                    <EuiSmallButtonEmpty onClick={onDiscardDraft}>
                      Discard draft
                    </EuiSmallButtonEmpty>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
              <EuiFlexItem grow={false} style={{ marginLeft: '-2px' }}>
                <EuiSpacer size="m" />
                <EuiButtonGroup
                  style={{ maxWidth: '115px' }}
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
                />
              </EuiFlexItem>
            </EuiAccordion>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    </EuiPanel>
  );
}
