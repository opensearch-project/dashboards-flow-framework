/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTextArea,
  EuiCallOut,
} from '@elastic/eui';
import { MODEL_STATE, ModelFormValue } from '../../../../common';
import { WorkflowFormValues } from '../../../../common/interfaces';
import { AppState, registerAgent, useAppDispatch } from '../../../store';
import { getDataSourceId } from '../../../utils';

interface SimplifiedAgentCreationModalProps {
  onClose: () => void;
}

export function SimplifiedAgentCreationModal(
  props: SimplifiedAgentCreationModalProps
) {
  const { onClose } = props;
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { models } = useSelector((state: AppState) => state.ml);
  const { setFieldValue } = useFormikContext<WorkflowFormValues>();

  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<ModelFormValue>({
    id: '',
  });
  const [isCreatingAgent, setIsCreatingAgent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));

  const handleCreateAgent = async (
    name: string,
    description: string,
    modelId: string
  ) => {
    setError(null);
    setIsCreatingAgent(true);

    try {
      const newAgent = {
        name,
        type: 'flow',
        description:
          description || `Agent created for an agentic search workflow.`,
        tools: [
          {
            type: 'QueryPlanningTool',
            description: 'A general tool to answer any question',
            parameters: {
              model_id: modelId || 'claude3-haiku-20240307',
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
        // Set the newly created agent as the selected one
        setFieldValue('search.agentId', response.agent.id);

        // Close the modal
        props.onClose();
      } else {
        setError('Invalid response from server. Failed to create agent.');
      }
    } catch (error) {
      setError('Failed to create agent: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreatingAgent(false);
    }
  };

  // Clear form data on close
  const handleClose = () => {
    setAgentName('');
    setAgentDescription('');
    setSelectedModelId({ id: '' });
    onClose();
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!agentName.trim()) {
      return;
    }
    handleCreateAgent(agentName, agentDescription, selectedModelId.id);
  };

  return (
    <EuiModal onClose={handleClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Create New Agent</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {error && (
          <>
            <EuiCallOut title="Error" color="danger" iconType="alert">
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </>
        )}

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
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={handleClose}>Cancel</EuiButtonEmpty>
        <EuiButton
          onClick={handleSubmit}
          fill
          isDisabled={!agentName.trim()}
          isLoading={isCreatingAgent}
        >
          Create Agent
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
