/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexItem,
  EuiSpacer,
  EuiFormRow,
  EuiAccordion,
  EuiText,
  EuiLink,
  EuiComboBox,
} from '@elastic/eui';
import {
  Agent,
  AGENT_FIELDS_DOCS_LINK,
  AGENT_LLM_INTERFACE_TYPE,
  AGENT_TYPE,
  ConnectorDict,
  MEMORY_DOCS_LINK,
  ModelDict,
} from '../../../../../common';
import { AgentMemory } from './agent_memory';
import { AppState } from '../../../../store';

interface AgentAdvancedSettingsProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const LLM_INTERFACE_OPTIONS = Object.values(AGENT_LLM_INTERFACE_TYPE).map(
  (interfaceType) => ({
    value: interfaceType,
    label: getReadableInterface(interfaceType),
  })
);

/**
 * Configure advanced settings for agents.
 */
export function AgentAdvancedSettings(props: AgentAdvancedSettingsProps) {
  const { models, connectors } = useSelector((state: AppState) => state.ml);
  const agentType = getIn(props, 'agentForm.type', '').toLowerCase();
  const agentModelId = getIn(props, 'agentForm.llm.model_id', '');
  const agentLlmInterface = getIn(
    props,
    'agentForm.parameters._llm_interface',
    ''
  ) as AGENT_LLM_INTERFACE_TYPE;

  // listen to agent model changes. Try to automatically set the _llm_interface, if applicable
  useEffect(() => {
    if (agentType === AGENT_TYPE.CONVERSATIONAL && !isEmpty(agentModelId)) {
      props.setAgentForm({
        ...props.agentForm,
        parameters: {
          ...props.agentForm?.parameters,
          _llm_interface:
            getRelevantInterface(agentModelId, models, connectors) ||
            agentLlmInterface,
        },
      });
    }
  }, [agentType, agentModelId, agentLlmInterface]);

  return (
    <EuiAccordion
      id="agentAdvancedSettings"
      initialIsOpen={false}
      buttonContent="Advanced settings"
    >
      <EuiSpacer size="s" />
      {/**
       * For agent types that allow for memory, provide custom form inputs for that.
       */}
      {agentType === AGENT_TYPE.CONVERSATIONAL && (
        <>
          <EuiFlexItem grow={false}>
            <EuiFormRow
              label={'Memory'}
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={MEMORY_DOCS_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              }
              fullWidth
            >
              <AgentMemory
                agentForm={props.agentForm}
                setAgentForm={props.setAgentForm}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiSpacer size="s" />
          <EuiFlexItem grow={false}>
            <EuiFormRow
              label="LLM Interface"
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={AGENT_FIELDS_DOCS_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              }
              fullWidth
            >
              <EuiComboBox
                options={LLM_INTERFACE_OPTIONS}
                selectedOptions={[
                  { label: getReadableInterface(agentLlmInterface) },
                ]}
                onChange={(e) => {
                  const optionValue = getIn(e, '0.value', '');
                  props.setAgentForm({
                    ...props.agentForm,
                    parameters: {
                      ...props.agentForm?.parameters,
                      _llm_interface: optionValue as AGENT_LLM_INTERFACE_TYPE,
                    },
                  });
                }}
                onCreateOption={(modelInterface) => {
                  props.setAgentForm({
                    ...props.agentForm,
                    parameters: {
                      ...props.agentForm?.parameters,
                      _llm_interface: modelInterface as AGENT_LLM_INTERFACE_TYPE,
                    },
                  });
                }}
                customOptionText="Add {searchValue}"
                placeholder="Select an LLM interface"
                singleSelection={{ asPlainText: true }}
                isClearable={false}
                compressed
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiSpacer size="s" />
        </>
      )}
    </EuiAccordion>
  );
}

// Basic util fn to hide the interface complexity, and just display the model provider/company
function getReadableInterface(interfaceType: AGENT_LLM_INTERFACE_TYPE): string {
  switch (interfaceType) {
    case AGENT_LLM_INTERFACE_TYPE.OPENAI:
      return 'OpenAI';
    case AGENT_LLM_INTERFACE_TYPE.BEDROCK_CLAUDE:
      return 'Bedrock Claude';
    case AGENT_LLM_INTERFACE_TYPE.BEDROCK_DEEPSEEK:
      return 'Bedrock DeepSeek';
    default:
      return interfaceType;
  }
}

// attempt to parse the upstream connector details and try to derive the inference endpoints
// and remote model information. keep as 'undefined' if not found.
function getRelevantInterface(
  modelId: string,
  models: ModelDict,
  connectors: ConnectorDict
): AGENT_LLM_INTERFACE_TYPE | undefined {
  const model = getIn(models, modelId, {});
  // A connector can be defined within a model, or a reference to a standalone connector ID.
  const connector = !isEmpty(getIn(model, 'connector', {}))
    ? getIn(model, 'connector', {})
    : getIn(connectors, getIn(model, 'connectorId', ''), {});

  const connectorModel = getIn(connector, 'parameters.model', '') as string;
  const connectorServiceName = getIn(
    connector,
    'parameters.service_name',
    ''
  ) as string;
  const remoteInferenceUrl = getIn(connector, 'actions.0.url', '') as string;

  if (connectorModel.includes('gpt') || remoteInferenceUrl.includes('openai')) {
    return AGENT_LLM_INTERFACE_TYPE.OPENAI;
  } else if (
    connectorModel.includes('claude') &&
    connectorServiceName.includes('bedrock')
  ) {
    return AGENT_LLM_INTERFACE_TYPE.BEDROCK_CLAUDE;
  } else if (
    connectorModel.includes('deepseek') &&
    connectorServiceName.includes('bedrock')
  ) {
    return AGENT_LLM_INTERFACE_TYPE.BEDROCK_DEEPSEEK;
  } else {
    return undefined;
  }
}
