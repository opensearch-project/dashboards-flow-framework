/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import { EuiFormRow, EuiPanel, EuiSelect } from '@elastic/eui';
import {
  Agent,
  AgentLLM,
  customStringify,
  Model,
  MODEL_STATE,
  ModelDict,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { SimplifiedJsonField } from './simplified_json_field';

interface AgentLLMFieldsProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

/**
 * The general component containing all of the "llm" config fields within an agent.
 */
export function AgentLLMFields({
  agentForm,
  setAgentForm,
}: AgentLLMFieldsProps) {
  // get redux store for models / search templates / etc. if needed in downstream tool configs
  const { models } = useSelector((state: AppState) => state.ml);
  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));
  const llmForm = getIn(agentForm, `llm`) as AgentLLM;
  const selectedModelId = getIn(llmForm, 'model_id', '') as string;
  const modelParameters = getIn(llmForm, 'parameters', {}) as {};
  const modelFound = Object.values(models || ({} as ModelDict)).some(
    (model: Model) => model.id === selectedModelId
  );
  const modelEmpty = isEmpty(selectedModelId);

  return (
    <EuiPanel color="transparent" paddingSize="s">
      <EuiFormRow
        label="Model"
        fullWidth
        isInvalid={!modelFound && !modelEmpty}
        error="Model not found"
      >
        <EuiSelect
          options={
            modelFound || modelEmpty
              ? modelOptions
              : [
                  ...modelOptions,
                  {
                    value: selectedModelId,
                    text: `Unknown model (ID: ${selectedModelId})`,
                  },
                ]
          }
          value={selectedModelId}
          onChange={(e) => {
            setAgentForm({
              ...agentForm,
              llm: {
                ...agentForm?.llm,
                model_id: e.target.value as string,
              },
            });
          }}
          aria-label="Select model"
          placeholder="Select a model"
          hasNoInitialSelection={true}
          isInvalid={!modelFound && !modelEmpty}
          fullWidth
        />
      </EuiFormRow>
      <EuiFormRow label="Parameters" fullWidth>
        <SimplifiedJsonField
          value={customStringify(modelParameters)}
          onBlur={(e) => {
            try {
              const llmParametersUpdated = JSON.parse(e);
              setAgentForm({
                ...agentForm,
                llm: {
                  ...agentForm.llm,
                  parameters: llmParametersUpdated,
                },
              });
              //setJsonError(undefined);
            } catch (error) {
              //   setJsonError(
              //     'Invalid JSON: ' + (error as Error)?.message || ''
              //   );
            }
          }}
          editorHeight="120px"
          // isInvalid={jsonError !== undefined}
          helpText="Custom LLM parameters"
        />
      </EuiFormRow>
    </EuiPanel>
  );
}
