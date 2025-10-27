/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
import { EuiFormRow, EuiLink, EuiSelect, EuiText } from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  AGENTIC_SEARCH_MODELS_DOCS_LINK,
  AgentLLM,
  Model,
  MODEL_STATE,
  ModelDict,
  Tool,
  TOOL_TYPE,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { NoDeployedModelsCallout } from '../components';

interface AgentLLMFieldsProps {
  agentType: AGENT_TYPE;
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

/**
 * The general component containing all of the "llm" config fields within an agent.
 */
export function AgentLLMFields({
  agentType,
  agentForm,
  setAgentForm,
}: AgentLLMFieldsProps) {
  // get redux store for models / search templates / etc. if needed in downstream tool configs
  const { models } = useSelector((state: AppState) => state.ml);
  const [modelOptions, setModelOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    setModelOptions(
      Object.values(models || {})
        .filter((model) => model.state === MODEL_STATE.DEPLOYED)
        .map((model) => ({
          value: model.id,
          text: model.name || model.id,
        }))
    );
  }, [models]);
  const llmForm = getIn(agentForm, `llm`) as AgentLLM;
  const toolsField = getIn(agentForm, 'tools', []) as Tool[];
  const queryPlanningToolIndex = toolsField.findIndex(
    (tool) => tool.type === TOOL_TYPE.QUERY_PLANNING
  );
  const selectedModelId =
    agentType === AGENT_TYPE.FLOW
      ? (getIn(
          agentForm,
          `tools.${queryPlanningToolIndex}.parameters.model_id`,
          ''
        ) as string)
      : (getIn(llmForm, 'model_id', '') as string);

  const modelFound = Object.values(models || ({} as ModelDict)).some(
    (model: Model) => model.id === selectedModelId
  );
  const modelEmpty = isEmpty(selectedModelId);

  return (
    <EuiFormRow
      label="Model"
      fullWidth
      labelAppend={
        <EuiText size="xs">
          <EuiLink href={AGENTIC_SEARCH_MODELS_DOCS_LINK} target="_blank">
            Learn more
          </EuiLink>
        </EuiText>
      }
      isInvalid={!modelFound && !modelEmpty}
    >
      <>
        {modelOptions.length === 0 ? (
          <NoDeployedModelsCallout />
        ) : (
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
            // if a conversational agent, also set it as the main LLM orchestration agent
            onChange={(e) => {
              let updatedAgentForm = cloneDeep(agentForm);
              if (agentType === AGENT_TYPE.CONVERSATIONAL) {
                set(updatedAgentForm, 'llm.model_id', e.target.value);
              }
              setAgentForm(updatedAgentForm);
            }}
            aria-label="Select model"
            placeholder="Select a model"
            hasNoInitialSelection={true}
            isInvalid={!modelFound && !modelEmpty}
            fullWidth
            compressed
          />
        )}
      </>
    </EuiFormRow>
  );
}
