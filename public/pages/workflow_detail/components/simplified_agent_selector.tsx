/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiHorizontalRule,
  EuiPanel,
  EuiButton,
} from '@elastic/eui';
import {
  AppState,
  registerAgent,
  searchAgents,
  useAppDispatch,
} from '../../../store';
import {
  FETCH_ALL_QUERY_LARGE,
  MODEL_STATE,
  ModelFormValue,
  WorkflowFormValues,
} from '../../../../common';
import { getDataSourceId } from '../../../utils/utils';

interface SimplifiedAgentSelectorProps {}

export function SimplifiedAgentSelector(props: SimplifiedAgentSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const selectedAgentId = getIn(values, 'search.agentId');

  const [createMode, setCreateMode] = useState<boolean>(false);
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<ModelFormValue>({
    id: '',
  });
  const [isCreatingAgent, setIsCreatingAgent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

  const { agents, loading, models } = useSelector(
    (state: AppState) => state.ml
  );

  // Fetch agents on initial load
  useEffect(() => {
    dispatch(searchAgents({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
  }, []);

  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));
  const agentOptions = Object.values(agents || {}).map((agent) => ({
    value: agent.id,
    text: agent.name,
  }));
  const selectedAgent = !isEmpty(selectedAgentId)
    ? agents[selectedAgentId]
    : undefined;

  // Close accordion when agent is selected
  useEffect(() => {
    if (!isEmpty(selectedAgentId)) {
      setAccordionOpen(false);
    }
  }, [selectedAgentId]);

  // Create a new agent
  const createNewAgent = async () => {
    if (!agentName.trim()) {
      setError('Please enter an agent name');
      return;
    }

    setError(null);
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
              model_id: selectedModelId?.id || 'claude3-haiku-20240307',
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
        setFieldValue('search.agentId', response.agent.id);
        // Switch back to select mode and collapse accordion
        setCreateMode(false);
        setAccordionOpen(false);

        // Reset form fields
        setAgentName('');
        setAgentDescription('');
        setSelectedModelId({ id: '' });
      } else {
        setError('Invalid response from server. Failed to create agent.');
      }
    } catch (error) {
      setError('Failed to create agent: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreatingAgent(false);
    }
  };

  function getAgentDisplayContent() {
    if (loading) {
      return (
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="m" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s">Loading agents...</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    if (selectedAgent) {
      return (
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiIcon type="agent" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText size="s">
                  <strong>{selectedAgent.name}</strong>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setAccordionOpen(true);
              }}
            >
              Change
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    return (
      <EuiText size="s" color="subdued">
        No agent selected. Click to select or create an agent.
      </EuiText>
    );
  }

  return (
    <EuiAccordion
      id="agentSelectorAccordion"
      buttonContent={getAgentDisplayContent()}
      paddingSize="m"
      forceState={accordionOpen ? 'open' : 'closed'}
      onToggle={(isOpen) => setAccordionOpen(isOpen)}
      style={{ width: '100%' }}
    >
      <EuiPanel
        hasShadow={false}
        color="subdued"
        paddingSize="m"
        style={{ width: '100%' }}
      >
        {error && (
          <>
            <EuiCallOut title="Error" color="danger" iconType="alert">
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </>
        )}
        <EuiFlexGroup
          gutterSize="s"
          alignItems="center"
          justifyContent="flexStart"
        >
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              color={!createMode ? 'primary' : 'text'}
              onClick={() => setCreateMode(false)}
              size="s"
              iconType="list"
            >
              Select existing agent
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              color={createMode ? 'primary' : 'text'}
              onClick={() => setCreateMode(true)}
              size="s"
              iconType="plusInCircle"
            >
              Create new agent
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin="s" />
        {!createMode ? (
          <EuiFormRow label="Select Agent" fullWidth>
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
                <p>No agents are available. Please create a new agent.</p>
                <EuiButton
                  size="s"
                  onClick={() => setCreateMode(true)}
                  iconType="plusInCircle"
                >
                  Create new agent
                </EuiButton>
              </EuiCallOut>
            ) : (
              <EuiSelect
                options={agentOptions}
                value={selectedAgentId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFieldValue('search.agentId', value);
                    setAccordionOpen(false);
                  }
                }}
                aria-label="Select agent"
                placeholder="Select an agent"
                hasNoInitialSelection={isEmpty(selectedAgentId)}
                fullWidth
              />
            )}
          </EuiFormRow>
        ) : (
          <>
            <EuiFormRow label="Agent Name (required)">
              <EuiFieldText
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                aria-label="Enter agent name"
                required
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
                rows={2}
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
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={createNewAgent}
                  isDisabled={!agentName.trim()}
                  isLoading={isCreatingAgent}
                  fill
                  size="s"
                >
                  Create Agent
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        )}
      </EuiPanel>
    </EuiAccordion>
  );
}
