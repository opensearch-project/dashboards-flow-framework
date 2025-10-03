/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import { EuiFormRow, EuiLink, EuiSelect, EuiText } from '@elastic/eui';
import {
  Agent,
  AGENTIC_SEARCH_DOCS_LINK,
  AgentLLM,
  Model,
  MODEL_STATE,
  ModelDict,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { NoDeployedModelsCallout } from '../components';

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
  const selectedModelId = getIn(llmForm, 'model_id', '');
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
          <EuiLink href={AGENTIC_SEARCH_DOCS_LINK} target="_blank">
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
            compressed
          />
        )}
      </>
    </EuiFormRow>
  );
}
