/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
  EuiButton,
} from '@elastic/eui';
import { MODEL_STATE, ModelFormValue } from '../../../../../common';
import { AppState, useAppDispatch } from '../../../../store';
import { AgentSelector } from './agent_selector';
import { getDataSourceId } from '../../../../utils';

interface AgentConfigurationProps {
  // Will add more props as needed when expanding functionality
}

/**
 * Parent component for all agent configuration elements
 */
export function AgentConfiguration(props: AgentConfigurationProps) {
  // These will be used later when implementing save functionality
  // const dispatch = useAppDispatch();
  // const dataSourceId = getDataSourceId();
  const { models } = useSelector((state: AppState) => state.ml);

  // State for agent configuration form fields
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<ModelFormValue>({
    id: '',
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);

  // Handle save button click
  const handleSave = () => {
    setIsSaving(true);
    // This is where you would actually implement the save functionality
    // For now, just simulate a save with a timeout
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  // Create model options for the dropdown
  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));

  // do several actions if user wants to create a new agent, including:
  // - open the configuration accordion
  // - clear any existing selected agent and put a placeholder value there
  function onCreateNew() {
    setIsAccordionOpen(true);
    // TODO integrate more with the dropdown
  }

  return (
    <EuiPanel color="subdued" hasShadow={false} paddingSize="s">
      <EuiFlexGroup direction="column" gutterSize="m">
        <EuiFlexItem>
          <AgentSelector onCreateNew={onCreateNew} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiAccordion
            id="agentConfigAccordion"
            buttonContent="Configuration"
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
            <EuiButton
              onClick={handleSave}
              fill
              isDisabled={!agentName.trim()}
              isLoading={isSaving}
            >
              Save
            </EuiButton>
          </EuiAccordion>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
