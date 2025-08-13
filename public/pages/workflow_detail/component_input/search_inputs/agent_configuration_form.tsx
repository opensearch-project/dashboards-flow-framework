/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiPanel,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiSmallButton,
  EuiLoadingSpinner,
  EuiCallOut,
  EuiButtonGroup,
} from '@elastic/eui';
import { ModelField } from '../input_fields/model_field';
import { AppState, registerAgent, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils/utils';

interface AgentConfigurationFormProps {
  selectedAgentId: string;
  onAgentSelected: (agentId: string) => void;
  selectedIndex?: string;
}

enum AgentConfigTab {
  SELECT = 'select',
  CREATE = 'create',
}

/**
 * Component for agent selection and creation
 */
export function AgentConfigurationForm(props: AgentConfigurationFormProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const [tabId, setTabId] = useState<AgentConfigTab>(AgentConfigTab.SELECT);

  // Temp form fields
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Misc states
  const [isCreatingAgent, setIsCreatingAgent] = useState<boolean>(false);
  const [showAgentConfirmation, setShowAgentConfirmation] = useState<boolean>(
    false
  );
  const [createError, setCreateError] = useState<string>('');

  const { agents, loading } = useSelector((state: AppState) => state.ml);

  useEffect(() => {
    setTabId(AgentConfigTab.SELECT);
  }, []);

  const createNewAgent = async () => {
    if (!agentName.trim() || !selectedModelId.trim()) return;
    setCreateError('');
    setIsCreatingAgent(true);

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
              model_id: selectedModelId,
              response_filter: '$.output.message.content[0].text',
            },
          },
        ],
      };

      // Register the agent and wait for the response
      const response = await dispatch(
        registerAgent({
          apiBody: newAgent,
          dataSourceId,
        })
      ).unwrap();

      if (response && response.agent && response.agent.id) {
        props.onAgentSelected(response.agent.id);
        setShowAgentConfirmation(true);
        setTabId(AgentConfigTab.SELECT);

        // Reset form fields
        setAgentName('');
        setAgentDescription('');
        setSelectedModelId('');
      } else {
        console.error('Invalid agent response:', response);
        setCreateError('Invalid response from server. Failed to create agent.');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setCreateError(
        'Failed to create agent: ' + (error.message || 'Unknown error')
      );
    } finally {
      setIsCreatingAgent(false);
    }
  };

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiText size="m">
            <h3>Agent Configuration</h3>
          </EuiText>
          <EuiText size="s" color="subdued">
            Select an existing agent or create a new one.
          </EuiText>
          <EuiSpacer size="m" />
          {showAgentConfirmation && (
            <>
              <EuiCallOut
                title="Agent ID added to query"
                color="success"
                iconType="checkInCircleFilled"
                size="s"
                onDismiss={() => setShowAgentConfirmation(false)}
              >
                <p>
                  Agent ID has been successfully added to your query. You can
                  view the updated query in the Query Definition tab.
                </p>
              </EuiCallOut>
              <EuiSpacer size="m" />
            </>
          )}
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiButtonGroup
            legend="Agent mode"
            options={[
              {
                id: AgentConfigTab.SELECT,
                label: 'Select existing',
                iconType: 'list',
              },
              {
                id: AgentConfigTab.CREATE,
                label: 'Create new',
                iconType: 'plusInCircle',
              },
            ]}
            idSelected={tabId}
            onChange={(id) => {
              setTabId(id as AgentConfigTab);
            }}
            buttonSize="s"
            isFullWidth
            color="primary"
          />
          <EuiSpacer size="m" />
        </EuiFlexItem>

        {tabId === AgentConfigTab.SELECT ? (
          <EuiFlexItem>
            <EuiFormRow label="Select agent">
              {loading ? (
                <EuiFlexGroup alignItems="center" gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiLoadingSpinner size="m" />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiText size="s">Loading agents...</EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              ) : Object.keys(agents || {}).length === 0 ? (
                <EuiCallOut
                  title="No agents found"
                  color="warning"
                  iconType="alert"
                  size="s"
                >
                  <p>
                    No agents are available. Please select "Create new agent"
                    option to create one.
                  </p>
                </EuiCallOut>
              ) : (
                <EuiSelect
                  options={[
                    { value: '', text: '-- Select an agent --' },
                    ...Object.values(agents || {}).map((agent) => ({
                      value: agent.id,
                      text: agent.name,
                    })),
                  ]}
                  value={props.selectedAgentId}
                  onChange={(e) => {
                    if (e.target.value) {
                      props.onAgentSelected(e.target.value);
                      setShowAgentConfirmation(true);
                    }
                  }}
                  aria-label="Select agent"
                />
              )}
            </EuiFormRow>
          </EuiFlexItem>
        ) : (
          <EuiFlexItem>
            <EuiFormRow label="Agent name (required)">
              <EuiFieldText
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                aria-label="Enter agent name"
                required
              />
            </EuiFormRow>
            <EuiFormRow label="Description">
              <EuiTextArea
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Enter description"
                aria-label="Enter description"
                rows={3}
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <ModelField
              // TODO: fieldPath shouldn't be needed
              fieldPath="model"
              label="Large language model"
              helpText="Select a large language model (LLM) for the agent to use"
              onModelChange={(modelId) => setSelectedModelId(modelId)}
            />
            <EuiSpacer size="m" />
            {createError && (
              <>
                <EuiCallOut
                  title="Error creating agent"
                  color="danger"
                  iconType="alert"
                  size="s"
                >
                  <p>{createError}</p>
                </EuiCallOut>
                <EuiSpacer size="m" />
              </>
            )}
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiSmallButton
                  onClick={createNewAgent}
                  isDisabled={!agentName.trim() || isCreatingAgent}
                  isLoading={isCreatingAgent}
                  fill
                >
                  Create agent
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
}
