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
  EuiText,
} from '@elastic/eui';
import {
  FETCH_ALL_QUERY_LARGE,
  MODEL_STATE,
  ModelFormValue,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  AppState,
  getAgent,
  registerAgent,
  updateAgent,
  searchAgents,
  useAppDispatch,
} from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { isEmpty } from 'lodash';
import { AgentDetailsModal } from './agent_details_modal';

interface AgentConfigurationProps {
  uiConfig: WorkflowConfig | undefined;
}

const AGENT_ID_PATH = 'search.agentId';
const NEW_AGENT_PLACEHOLDER = 'new_agent';

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
  const { models, agents } = useSelector((state: AppState) => state.ml);
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;

  // State for agent configuration form fields
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<ModelFormValue>({
    id: '',
  });
  useEffect(() => {
    const selectedAgentIdForm = getIn(values, AGENT_ID_PATH, '') as string;
    const agent = agents[selectedAgentIdForm];
    if (!isEmpty(selectedAgentIdForm) && !isEmpty(agent)) {
      setAgentName(agent.name);
      setAgentDescription(agent.description || '');
    } else {
      setAgentName('');
      setAgentDescription('');
      setSelectedModelId({
        id: '',
      });
    }
  }, [getIn(values, AGENT_ID_PATH), agents]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(
    false
  );
  const [newAndUnsaved, setNewAndUnsaved] = useState<boolean>(false);
  const [agentOptions, setAgentOptions] = useState<
    { value: string; text: string }[]
  >([]);

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

  // Create model options for the dropdown
  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));

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
      props.uiConfig?.search?.agentId?.value || undefined
    );
    setIsAccordionOpen(false);
  }

  async function onCreateAgent() {
    setIsSaving(true);
    try {
      const newAgent = {
        name: agentName,
        type: 'flow',
        description:
          agentDescription || `Agent created for an agentic search workflow.`,
        tools: [
          {
            type: 'QueryPlanningTool',
            description: 'A general tool to answer any question',
            parameters: {
              model_id: selectedModelId.id || 'claude3-haiku-20240307',
              response_filter: '$.output.message.content[0].text',
            },
          },
        ],
      };
      const response = await dispatch(
        registerAgent({
          apiBody: newAgent,
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
      const updatedAgent = {
        name: agentName,
        type: 'flow',
        description:
          agentDescription || `Agent created for an agentic search workflow.`,
        tools: [
          {
            type: 'QueryPlanningTool',
            description: 'A general tool to answer any question',
            parameters: {
              model_id: selectedModelId.id || 'claude3-haiku-20240307',
              response_filter: '$.output.message.content[0].text',
            },
          },
        ],
      };
      await dispatch(
        updateAgent({
          agentId: selectedAgentId,
          body: updatedAgent,
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
      {isDetailsModalVisible && selectedAgentId && (
        <AgentDetailsModal
          onClose={() => setIsDetailsModalVisible(false)}
          agentId={selectedAgentId}
        />
      )}
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
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={onCreateNew}
                  iconType="plusInCircle"
                >
                  Create new
                </EuiButtonEmpty>
              </EuiFlexItem>
              {!isEmpty(selectedAgentId) && (
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    size="s"
                    onClick={async () => {
                      await dispatch(
                        getAgent({ agentId: selectedAgentId, dataSourceId })
                      )
                        .unwrap()
                        .then(() => {
                          setIsDetailsModalVisible(true);
                        });
                    }}
                  >
                    View details
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
              <EuiFormRow label="Name">
                <EuiFieldText
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  aria-label="Enter agent name"
                  fullWidth
                />
              </EuiFormRow>
              <EuiSpacer size="s" />
              <EuiFormRow label="Description">
                <EuiTextArea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Enter description"
                  aria-label="Enter description"
                  rows={3}
                  fullWidth
                />
              </EuiFormRow>
              <EuiSpacer size="s" />
              <EuiFormRow label="Model">
                <EuiSelect
                  options={modelOptions}
                  value={selectedModelId.id}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedModelId({ id: value });
                  }}
                  aria-label="Select model"
                  placeholder="Select a model"
                  hasNoInitialSelection={!selectedModelId.id}
                  fullWidth
                />
              </EuiFormRow>
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
                    // TODO: disable if an existing agent, with no changes.
                    isDisabled={!agentName.trim()}
                    isLoading={isSaving}
                  >
                    Save
                  </EuiSmallButton>
                </EuiFlexItem>
                {newAndUnsaved && (
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton fill={false} onClick={onDiscardDraft}>
                      Discard draft
                    </EuiSmallButton>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiAccordion>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>
    </EuiPanel>
  );
}
