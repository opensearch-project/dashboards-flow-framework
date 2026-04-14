/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPanel,
  EuiSelect,
  EuiTextArea,
  EuiRadioGroup,
  EuiLink,
  EuiFlexItem,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  ConnectorDict,
  EMBEDDING_MODEL_HELP_TEXT,
  EMBEDDING_MODEL_LABEL,
  Model,
  MODEL_STATE,
  NO_DEPLOYED_EMBEDDING_MODELS_TEXT,
  NO_DEPLOYED_LLMS_TEXT,
  NONE_OPTION,
  QUERY_PLANNING_MODEL_DOCS_LINK,
  QUERY_PLANNING_TOOL_DOCS_LINK,
  RESPONSE_FILTER_TYPE,
  Tool,
  TOOL_DESCRIPTION,
} from '../../../../../../common';
import { AppState } from '../../../../../store';
import {
  isKnownEmbeddingModel,
  isKnownLLM,
  parseStringOrJson,
} from '../../../../../utils';
import {
  NoDeployedModelsCallout,
  NoSearchTemplatesCallout,
  SimplifiedJsonField,
} from '../../components';
import { updateParameterValue } from './utils';

interface QueryPlanningToolProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
  toolIndex: number;
}

enum GENERATION_TYPE {
  LLM = 'llmGenerated',
  SEARCH_TEMPLATES = 'user_templates',
}
const GENERATION_TYPE_OPTIONS = [
  { value: GENERATION_TYPE.LLM, text: 'LLM-Generated' },
  { value: GENERATION_TYPE.SEARCH_TEMPLATES, text: 'Search Templates' },
];

interface SearchTemplateField {
  template_id: string;
  template_description: string;
}
const DEFAULT_SEARCH_TEMPLATE: SearchTemplateField = {
  template_id: '',
  template_description: '',
};

export function QueryPlanningTool(props: QueryPlanningToolProps) {
  const { models, connectors } = useSelector((state: AppState) => state.ml);
  const { searchTemplates } = useSelector(
    (state: AppState) => state.opensearch
  );
  const [modelOptions, setModelOptions] = useState<
    { value: string; text: string }[]
  >([]);
  const [embeddingModelOptions, setEmbeddingModelOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    const deployedModels = Object.values(models || {}).filter(
      (model) => model.state === MODEL_STATE.DEPLOYED
    );
    setModelOptions(
      deployedModels
        .filter((model) => !isKnownEmbeddingModel(model, connectors))
        .map((model) => ({ value: model.id, text: model.name || model.id }))
    );
    setEmbeddingModelOptions(
      deployedModels
        .filter((model) => !isKnownLLM(model, connectors))
        .map((model) => ({ value: model.id, text: model.name || model.id }))
    );
  }, [models, connectors]);
  const agentType = getIn(props.agentForm, 'type', '').toLowerCase() as string;
  const toolForm = getIn(props.agentForm, `tools.${props.toolIndex}`) as Tool;
  const generationType =
    toolForm?.parameters?.generation_type || GENERATION_TYPE.LLM;
  const searchTemplatesForm = parseStringOrJson(
    toolForm?.parameters?.search_templates || []
  ) as SearchTemplateField[];
  const generationTypeRadios = GENERATION_TYPE_OPTIONS.map((option) => ({
    id: option.value,
    label: option.text,
  }));
  const selectedModelId = toolForm?.parameters?.model_id;
  const selectedModel = getIn(models, selectedModelId) as Model | undefined;
  const modelFound = selectedModel !== undefined;
  const modelEmpty = isEmpty(selectedModelId);

  // Automatically add or remove response filters to the query planning tool, if applicable.
  useEffect(() => {
    if (agentType === AGENT_TYPE.FLOW && modelFound) {
      // Get relevant response filter based on model and connector.
      // If unknown, set to empty string so users can manually input the value.
      const relevantResponseFilter =
        getRelevantResponseFilter(selectedModel, connectors) || '';
      updateParameterValue(
        props.agentForm,
        props.setAgentForm,
        props.toolIndex,
        'response_filter',
        relevantResponseFilter
      );
    } else if (
      agentType === AGENT_TYPE.CONVERSATIONAL &&
      toolForm?.parameters?.response_filter
    ) {
      const toolsForm = getIn(props.agentForm, 'tools');
      const updatedTool = {
        ...toolForm,
        parameters: {
          ...toolForm.parameters,
        },
      };
      delete updatedTool.parameters.response_filter;
      props.setAgentForm({
        ...props.agentForm,
        tools: toolsForm.map((tool: Tool, i: number) =>
          i === props.toolIndex ? updatedTool : tool
        ),
      });
    }
  }, [agentType, selectedModel]);

  /**
   * Search template helper fns
   */
  const addSearchTemplate = () => {
    const updatedTemplates = [
      ...searchTemplatesForm,
      { ...DEFAULT_SEARCH_TEMPLATE },
    ];
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
    setOpenTemplateAccordionIndex(updatedTemplates.length - 1);
  };
  const updateSearchTemplate = (
    templateIndex: number,
    field: string,
    value: string
  ) => {
    const updatedTemplates = [...searchTemplatesForm];
    updatedTemplates[templateIndex] = {
      ...updatedTemplates[templateIndex],
      [field]: value,
    };
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
  };
  const removeSearchTemplate = (templateIndex: number) => {
    const updatedTemplates = searchTemplatesForm.filter(
      (_: SearchTemplateField, i: number) => i !== templateIndex
    );
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
  };

  // Persist state for each search template accordion. Only support one at a time
  const [openTemplateAccordionIndex, setOpenTemplateAccordionIndex] = useState<
    number | undefined
  >(undefined);
  const [fallbackQueryError, setFallbackQueryError] = useState<
    string | undefined
  >(undefined);

  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiText size="xs" color="subdued">
          <i>{TOOL_DESCRIPTION.QUERY_PLANNING}</i>
        </EuiText>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      {agentType === AGENT_TYPE.FLOW && (
        <EuiFormRow
          label="Large language model"
          data-testid="queryPlanningModelField"
          labelAppend={
            <EuiText size="xs">
              <EuiLink href={QUERY_PLANNING_MODEL_DOCS_LINK} target="_blank">
                Learn more
              </EuiLink>
            </EuiText>
          }
          fullWidth
          isInvalid={!modelFound && !modelEmpty}
        >
          <>
            {modelOptions.length === 0 ? (
              <NoDeployedModelsCallout title={NO_DEPLOYED_LLMS_TEXT} />
            ) : (
              <EuiSelect
                key={selectedModelId}
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
                  updateParameterValue(
                    props.agentForm,
                    props.setAgentForm,
                    props.toolIndex,
                    'model_id',
                    e.target.value
                  );
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
      )}
      <EuiFormRow
        label="Generation type"
        data-testid="generationTypeField"
        labelAppend={
          <EuiText size="xs">
            <EuiLink href={QUERY_PLANNING_TOOL_DOCS_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiText>
        }
        fullWidth
      >
        <EuiRadioGroup
          options={generationTypeRadios}
          idSelected={generationType}
          onChange={(id) => {
            updateParameterValue(
              props.agentForm,
              props.setAgentForm,
              props.toolIndex,
              'generation_type',
              id
            );
          }}
          compressed
          data-testid="generationTypeRadioGroup"
        />
      </EuiFormRow>
      {agentType === AGENT_TYPE.FLOW && (
        <EuiFormRow
          label={
            <>
              {EMBEDDING_MODEL_LABEL}
              <i> - optional</i>
            </>
          }
          helpText={EMBEDDING_MODEL_HELP_TEXT}
          data-testid="embeddingModelField"
          fullWidth
        >
          <>
            {embeddingModelOptions.length === 0 ? (
              <NoDeployedModelsCallout title={NO_DEPLOYED_EMBEDDING_MODELS_TEXT} />
            ) : (
              <EuiSelect
                options={[NONE_OPTION, ...embeddingModelOptions]}
                value={toolForm?.parameters?.embedding_model_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    const toolsForm = getIn(props.agentForm, 'tools');
                    const updatedParams = { ...toolForm.parameters };
                    delete updatedParams.embedding_model_id;
                    const updatedTool = {
                      ...toolForm,
                      parameters: updatedParams,
                    };
                    props.setAgentForm({
                      ...props.agentForm,
                      tools: toolsForm.map((tool: Tool, i: number) =>
                        i === props.toolIndex ? updatedTool : tool
                      ),
                    });
                  } else {
                    updateParameterValue(
                      props.agentForm,
                      props.setAgentForm,
                      props.toolIndex,
                      'embedding_model_id',
                      value
                    );
                  }
                }}
                aria-label="Select embedding model"
                fullWidth
                compressed
              />
            )}
          </>
        </EuiFormRow>
      )}
      {generationType === GENERATION_TYPE.SEARCH_TEMPLATES && (
        <>
          <EuiSpacer size="s" />
          <div>
            {Object.keys(searchTemplates || {}).length === 0 && (
              <NoSearchTemplatesCallout />
            )}
            {searchTemplatesForm.length > 0 &&
              searchTemplatesForm.map(
                (template: SearchTemplateField, templateIndex: number) => (
                  <div key={templateIndex} style={{ marginBottom: '8px' }}>
                    <EuiPanel color="transparent" paddingSize="s">
                      <EuiAccordion
                        id={`search-template-${templateIndex}`}
                        forceState={
                          openTemplateAccordionIndex === templateIndex
                            ? 'open'
                            : 'closed'
                        }
                        onToggle={(isOpen) => {
                          setOpenTemplateAccordionIndex(
                            isOpen ? templateIndex : undefined
                          );
                        }}
                        buttonContent={
                          <EuiText size="s">
                            {template.template_id ||
                              `Template ${templateIndex + 1}`}
                          </EuiText>
                        }
                        extraAction={
                          <EuiButtonIcon
                            aria-label="Remove template"
                            iconType="trash"
                            color="danger"
                            onClick={(e: any) => {
                              e.stopPropagation(); // Prevent accordion toggle
                              removeSearchTemplate(templateIndex);
                            }}
                          />
                        }
                        paddingSize="s"
                      >
                        <EuiPanel
                          color="subdued"
                          paddingSize="s"
                          hasBorder={false}
                        >
                          <EuiFormRow label="Template ID" fullWidth>
                            <EuiSelect
                              key={template.template_id}
                              options={[
                                ...Object.keys(searchTemplates || {}).map(
                                  (templateId) => ({
                                    value: templateId,
                                    text: templateId,
                                  })
                                ),
                              ]}
                              value={template.template_id}
                              onChange={(e) => {
                                const selectedTemplateId = e.target.value;
                                updateSearchTemplate(
                                  templateIndex,
                                  'template_id',
                                  selectedTemplateId
                                );
                              }}
                              placeholder="Select a template"
                              fullWidth
                              compressed
                              hasNoInitialSelection={isEmpty(
                                template.template_id
                              )}
                            />
                          </EuiFormRow>
                          <EuiSpacer size="s" />
                          <EuiFormRow label="Description" fullWidth>
                            <EuiTextArea
                              value={template.template_description}
                              onChange={(e) => {
                                updateSearchTemplate(
                                  templateIndex,
                                  'template_description',
                                  e.target.value
                                );
                              }}
                              placeholder="Enter description"
                              fullWidth
                              compressed
                            />
                          </EuiFormRow>
                        </EuiPanel>
                      </EuiAccordion>
                    </EuiPanel>
                  </div>
                )
              )}
            <EuiSmallButtonEmpty
              style={{ marginLeft: '-8px' }}
              iconType="plusInCircle"
              onClick={addSearchTemplate}
              data-testid="addTemplateButton"
            >
              Add template
            </EuiSmallButtonEmpty>
          </div>
        </>
      )}
      <SimplifiedJsonField
        label="Fallback query"
        helpText="Query DSL to use when the LLM-generated query fails or returns no results. Clear to use the default."
        value={toolForm?.parameters?.fallback_query || ''}
        onChange={(value) => {
          if (value.trim() === '') {
            setFallbackQueryError(undefined);
            const toolsForm = getIn(props.agentForm, 'tools');
            const updatedParams = { ...toolForm.parameters };
            delete updatedParams.fallback_query;
            const updatedTool = { ...toolForm, parameters: updatedParams };
            props.setAgentForm({
              ...props.agentForm,
              tools: toolsForm.map((tool: Tool, i: number) =>
                i === props.toolIndex ? updatedTool : tool
              ),
            });
          } else {
            try {
              JSON.parse(value);
              setFallbackQueryError(undefined);
            } catch (e) {
              setFallbackQueryError('Invalid JSON');
            }
          }
        }}
        onBlur={(value) => {
          // onBlur only fires with valid JSON; clear error as a safeguard
          setFallbackQueryError(undefined);
          const toolsForm = getIn(props.agentForm, 'tools');
          const updatedTool = {
            ...toolForm,
            parameters: {
              ...toolForm.parameters,
              fallback_query: value,
            },
          };
          props.setAgentForm({
            ...props.agentForm,
            tools: toolsForm.map((tool: Tool, i: number) =>
              i === props.toolIndex ? updatedTool : tool
            ),
          });
        }}
        editorHeight="25vh"
        isInvalid={fallbackQueryError !== undefined}
        error={fallbackQueryError}
      />
    </>
  );
}

// attempt to parse the upstream connector details and try to derive the relevant response filter.
// Follows very similar logic to getRelevantInterface() in agent_advanced_settings.tsx.
// Currently, only OpenAI and Bedrock Claude have native response filtering support.
export function getRelevantResponseFilter(
  model: Model,
  connectors: ConnectorDict
): RESPONSE_FILTER_TYPE | undefined {
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
    return RESPONSE_FILTER_TYPE.OPENAI;
  } else if (
    connectorModel.includes('claude') &&
    connectorServiceName.includes('bedrock')
  ) {
    return RESPONSE_FILTER_TYPE.BEDROCK_CLAUDE;
  } else {
    return undefined;
  }
}
