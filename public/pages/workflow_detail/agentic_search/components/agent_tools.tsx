/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPopover,
  EuiContextMenuItem,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiTextArea,
  EuiRadioGroup,
} from '@elastic/eui';
import {
  Agent,
  Model,
  MODEL_STATE,
  ModelDict,
  Tool,
  TOOL_TYPE,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { parseStringOrJson } from '../../../../utils';
import { NoDeployedModelsCallout } from './no_deployed_models_callout';

interface AgentToolsProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const EMPTY_TOOL: Tool = {
  type: '' as TOOL_TYPE,
  description: '',
  parameters: {},
};

const TOOL_TYPE_OPTIONS = Object.entries(TOOL_TYPE).map(([key, value]) => ({
  value,
  text: key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const DEFAULT_SYSTEM_PROMPT_QUERY_PLANNING_TOOL =
  'You are an OpenSearch Query DSL generation assistant, translating natural language questions to OpenSearch DSL Queries';

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

export function AgentTools({ agentForm, setAgentForm }: AgentToolsProps) {
  // get redux store for models / search templates / etc. if needed in downstream tool configs
  const { models } = useSelector((state: AppState) => state.ml);
  const { searchTemplates } = useSelector(
    (state: AppState) => state.opensearch
  );
  const modelOptions = Object.values(models || {})
    .filter((model) => model.state === MODEL_STATE.DEPLOYED)
    .map((model) => ({
      value: model.id,
      text: model.name || model.id,
    }));

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<
    number | undefined
  >(undefined);
  const [openTemplateAccordionIndex, setOpenTemplateAccordionIndex] = useState<
    number | undefined
  >(undefined);
  const tools = agentForm?.tools || [];

  const addTool = (toolType: TOOL_TYPE) => {
    const newTool: Tool = {
      ...EMPTY_TOOL,
      type: toolType,
      parameters: toolType ? getDefaultParameters(toolType) : {},
    };
    const updatedTools = [...tools, newTool];
    setAgentForm({ ...agentForm, tools: updatedTools });
    // for other basic tools, don't open by default, as we don't expose anything to configure for them.
    if (
      toolType === TOOL_TYPE.QUERY_PLANNING ||
      toolType === TOOL_TYPE.WEB_SEARCH
    ) {
      setOpenAccordionIndex(updatedTools.length - 1);
    }
  };

  const removeTool = (index: number) => {
    const updatedTools = tools.filter((_, i) => i !== index);
    setAgentForm({ ...agentForm, tools: updatedTools });
  };

  const getDefaultParameters = (toolType: TOOL_TYPE) => {
    switch (toolType) {
      case TOOL_TYPE.QUERY_PLANNING:
        return {
          model_id: '',
          response_filter: '$.output.message.content[0].text',
          system_prompt: DEFAULT_SYSTEM_PROMPT_QUERY_PLANNING_TOOL,
          generation_type: GENERATION_TYPE.LLM,
          search_templates: [],
        };
      case TOOL_TYPE.SEARCH_INDEX:
        return {};
      default:
        return {};
    }
  };

  // reusable fn for updating single parameter values for a given tool (tool is determined based on index)
  function updateParameterValue(
    parameterName: string,
    parameterValue: string | any,
    index: number
  ) {
    const toolsForm = getIn(agentForm, 'tools');
    const toolForm = getIn(agentForm, `tools.${index}`) as Tool;
    const updatedTool = {
      ...toolForm,
      parameters: {
        ...toolForm.parameters,
        [parameterName]: parseStringOrJson(parameterValue),
      },
    };
    setAgentForm({
      ...agentForm,
      tools: toolsForm.map((tool: Tool, i: number) =>
        i === index ? updatedTool : tool
      ),
    });
  }

  const renderToolForm = (toolType: TOOL_TYPE, index: number): any => {
    const toolForm = getIn(agentForm, `tools.${index}`) as Tool;
    switch (toolType) {
      case TOOL_TYPE.QUERY_PLANNING:
        const responseFilter = toolForm?.parameters?.response_filter;
        const systemPrompt = toolForm?.parameters?.system_prompt;
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
        const modelFound = Object.values(models || ({} as ModelDict)).some(
          (model: Model) => model.id === selectedModelId
        );
        const modelEmpty = isEmpty(selectedModelId);

        const addSearchTemplate = () => {
          const updatedTemplates = [
            ...searchTemplatesForm,
            { ...DEFAULT_SEARCH_TEMPLATE },
          ];
          updateParameterValue(
            'search_templates',
            JSON.stringify(updatedTemplates),
            index
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
            'search_templates',
            JSON.stringify(updatedTemplates),
            index
          );
        };
        const removeSearchTemplate = (templateIndex: number) => {
          const updatedTemplates = searchTemplatesForm.filter(
            (_: SearchTemplateField, i: number) => i !== templateIndex
          );
          updateParameterValue(
            'search_templates',
            JSON.stringify(updatedTemplates),
            index
          );
        };

        return (
          <>
            <EuiFormRow
              label="Model"
              fullWidth
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
                      updateParameterValue('model_id', e.target.value, index);
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
            <EuiFormRow label="Response filter" fullWidth>
              <EuiFieldText
                value={responseFilter}
                onChange={(e) => {
                  updateParameterValue(
                    'response_filter',
                    e.target.value,
                    index
                  );
                }}
                aria-label="Specify a response filter"
                placeholder="Response filter"
                fullWidth
                compressed
              />
            </EuiFormRow>
            <EuiFormRow label="System prompt" fullWidth>
              <>
                <EuiTextArea
                  value={systemPrompt}
                  onChange={(e) => {
                    updateParameterValue(
                      'system_prompt',
                      e.target.value,
                      index
                    );
                  }}
                  aria-label="Specify a system prompt"
                  placeholder="System prompt"
                  fullWidth
                  compressed
                />
                <EuiSmallButtonEmpty
                  style={{ marginLeft: '-8px', marginTop: '-8px' }}
                  disabled={isEqual(
                    DEFAULT_SYSTEM_PROMPT_QUERY_PLANNING_TOOL,
                    toolForm?.parameters?.system_prompt
                  )}
                  onClick={() => {
                    updateParameterValue(
                      'system_prompt',
                      DEFAULT_SYSTEM_PROMPT_QUERY_PLANNING_TOOL,
                      index
                    );
                  }}
                >
                  <EuiText size="xs">Reset to default</EuiText>
                </EuiSmallButtonEmpty>
              </>
            </EuiFormRow>
            <EuiFormRow label="Generation type" fullWidth>
              <EuiRadioGroup
                options={generationTypeRadios}
                idSelected={generationType}
                onChange={(id) => {
                  updateParameterValue('generation_type', id, index);
                }}
                compressed
              />
            </EuiFormRow>
            {generationType === GENERATION_TYPE.SEARCH_TEMPLATES && (
              <>
                <EuiSpacer size="s" />
                <div>
                  {searchTemplatesForm.length > 0 &&
                    searchTemplatesForm.map(
                      (
                        template: SearchTemplateField,
                        templateIndex: number
                      ) => (
                        <div
                          key={templateIndex}
                          style={{ marginBottom: '8px' }}
                        >
                          <EuiPanel color="transparent" paddingSize="s">
                            <EuiAccordion
                              id={`search-template-${templateIndex}`}
                              forceState={
                                openTemplateAccordionIndex === templateIndex
                                  ? 'open'
                                  : undefined
                              }
                              onToggle={(isOpen) => {
                                setOpenTemplateAccordionIndex(
                                  isOpen ? templateIndex : undefined
                                );
                              }}
                              buttonContent={
                                <EuiText size="s">
                                  <strong>
                                    {template.template_id ||
                                      `Template ${templateIndex + 1}`}
                                  </strong>
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
                                        'description',
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
                  >
                    Add template
                  </EuiSmallButtonEmpty>
                </div>
              </>
            )}
          </>
        );
      case TOOL_TYPE.WEB_SEARCH:
        const input = toolForm?.parameters?.input;
        const engine = toolForm?.parameters?.engine;
        return (
          <>
            <EuiFormRow label="Engine" fullWidth>
              <EuiFieldText
                value={engine}
                onChange={(e) => {
                  updateParameterValue('engine', e.target.value, index);
                }}
                aria-label="Specify the engine"
                placeholder="Engine"
                fullWidth
                compressed
              />
            </EuiFormRow>
            <EuiFormRow label="Input" fullWidth>
              <EuiFieldText
                value={input}
                onChange={(e) => {
                  updateParameterValue('input', e.target.value, index);
                }}
                aria-label="Specify the input"
                placeholder="Input"
                fullWidth
                compressed
              />
            </EuiFormRow>
          </>
        );
      // In general, users should be using these in conjunction with conversational agents,
      // which will determine the tool inputs. So, we expose no explicit fields to configure on the form.
      // If it is needed, users can edit via JSON directly.
      case TOOL_TYPE.SEARCH_INDEX:
      case TOOL_TYPE.LIST_INDEX:
      case TOOL_TYPE.INDEX_MAPPING:
        return (
          <EuiText size="s" color="subdued">
            Nothing to configure!
          </EuiText>
        );
      default:
        return (
          <EuiText size="s" color="subdued">
            Unsupported tool type. Please edit directly with the JSON editor.
          </EuiText>
        );
    }
  };

  return (
    <>
      {tools.map((tool, index) => (
        <div key={`tool_${index}`}>
          <EuiPanel
            key={index}
            color="transparent"
            paddingSize="s"
            style={{ paddingBottom: '0px' }}
          >
            <EuiAccordion
              id={`tool-accordion-${index}`}
              extraAction={
                <EuiButtonIcon
                  aria-label="Remove tool"
                  iconType="trash"
                  color="danger"
                  onClick={() => {
                    removeTool(index);
                  }}
                />
              }
              buttonContent={
                <EuiText size="s">
                  {TOOL_TYPE_OPTIONS.find(
                    (option) => option.value === tool.type
                  )?.text ||
                    tool?.type ||
                    'Unknown tool'}
                </EuiText>
              }
              paddingSize="s"
              forceState={openAccordionIndex === index ? 'open' : undefined}
              onToggle={(isOpen) => {
                setOpenAccordionIndex(isOpen ? index : undefined);
              }}
            >
              {renderToolForm(tool.type, index)}
            </EuiAccordion>
            <EuiSpacer size="s" />
          </EuiPanel>
          <EuiSpacer size="s" />
        </div>
      ))}
      <EuiPopover
        button={
          <EuiSmallButtonEmpty
            iconType="plusInCircle"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            Add tool
          </EuiSmallButtonEmpty>
        }
        isOpen={isPopoverOpen}
        closePopover={() => setIsPopoverOpen(false)}
        panelPaddingSize="s"
        anchorPosition="downLeft"
      >
        <div style={{ width: '300px' }}>
          {TOOL_TYPE_OPTIONS.map((option) => (
            <EuiContextMenuItem
              size="s"
              key={option.value}
              onClick={() => {
                addTool(option.value);
                setIsPopoverOpen(false);
              }}
              disabled={alreadyContainsTool(option.value, tools)}
            >
              {`${option.text}${
                alreadyContainsTool(option.value, tools) ? ' (Configured)' : ''
              }`}
            </EuiContextMenuItem>
          ))}
        </div>
      </EuiPopover>
    </>
  );
}

// util fn to determine if a tool is already chosen. Duplicate tools are not allowed and will fail
// during agent update/creation
function alreadyContainsTool(
  toolType: TOOL_TYPE,
  selectedTools: Tool[]
): boolean {
  const selectedToolTypes = selectedTools.map((tool) => tool.type);
  return selectedToolTypes.some(
    (selectedToolType) => selectedToolType === toolType
  );
}
