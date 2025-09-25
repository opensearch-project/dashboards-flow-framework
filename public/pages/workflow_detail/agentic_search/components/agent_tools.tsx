/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  EuiPopover,
  EuiContextMenuItem,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiTextArea,
  EuiRadioGroup,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  Model,
  MODEL_STATE,
  ModelDict,
  QUERY_PLANNING_MODEL_DOCS_LINK,
  QUERY_PLANNING_TOOL_DOCS_LINK,
  Tool,
  TOOL_TYPE,
  WEB_SEARCH_TOOL_DOCS_LINK,
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

  // only expose the QPT for flow agents
  const toolTypeOptions =
    agentForm.type !== AGENT_TYPE.FLOW
      ? TOOL_TYPE_OPTIONS
      : TOOL_TYPE_OPTIONS.filter(
          (tooltype) => tooltype.value === TOOL_TYPE.QUERY_PLANNING
        );

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
              label="Query planning model"
              labelAppend={
                <EuiText size="xs">
                  <EuiLink
                    href={QUERY_PLANNING_MODEL_DOCS_LINK}
                    target="_blank"
                  >
                    Learn more
                  </EuiLink>
                </EuiText>
              }
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
            <EuiFormRow
              label="Generation type"
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
        const engine = toolForm?.parameters?.engine;
        return (
          <>
            <EuiFormRow
              label="Engine"
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={WEB_SEARCH_TOOL_DOCS_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              }
              fullWidth
            >
              <EuiFieldText
                value={engine}
                onChange={(e) => {
                  updateParameterValue('engine', e.target.value, index);
                }}
                aria-label="Specify the engine"
                placeholder="Search engine - for example, duckduckgo"
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
      {tools.map((tool, index) => {
        const isConfigurable =
          tool.type === TOOL_TYPE.QUERY_PLANNING ||
          tool.type === TOOL_TYPE.WEB_SEARCH;
        const accordionTitle =
          TOOL_TYPE_OPTIONS.find((option) => option.value === tool.type)
            ?.text ||
          tool?.type ||
          'Unknown tool';
        const accordionDescription = getToolDescription(tool.type);
        return (
          <div key={`tool_${index}`}>
            <EuiPanel
              key={index}
              color="transparent"
              paddingSize="s"
              style={{ paddingBottom: '0px' }}
            >
              <EuiAccordion
                id={`tool-accordion-${index}`}
                arrowDisplay={isConfigurable ? 'left' : 'none'}
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
                  <EuiFlexGroup
                    direction="row"
                    alignItems="center"
                    gutterSize="m"
                  >
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">{accordionTitle}</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="xs" color="subdued">
                        <i>{accordionDescription}</i>
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                paddingSize="s"
                forceState={
                  isConfigurable
                    ? openAccordionIndex === index
                      ? 'open'
                      : undefined
                    : 'closed'
                }
                onToggle={(isOpen) => {
                  if (isConfigurable) {
                    setOpenAccordionIndex(isOpen ? index : undefined);
                  }
                }}
              >
                {renderToolForm(tool.type, index)}
              </EuiAccordion>
              <EuiSpacer size="s" />
            </EuiPanel>
            <EuiSpacer size="s" />
          </div>
        );
      })}
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
          {toolTypeOptions.map((option) => (
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

function getToolDescription(toolType: TOOL_TYPE): string {
  switch (toolType) {
    case TOOL_TYPE.INDEX_MAPPING:
      return 'Retrieves index mapping and setting information for an index';
    case TOOL_TYPE.LIST_INDEX:
      return 'Retrieves index information for the OpenSearch cluster';
    case TOOL_TYPE.QUERY_PLANNING:
      return 'Generates an OpenSearch query domain-specific language (DSL) query from a natural language question';
    case TOOL_TYPE.SEARCH_INDEX:
      return 'Searches an index using a query written in query domain-specific language (DSL)';
    case TOOL_TYPE.WEB_SEARCH:
      return 'Answers a user’s question using a web search';
    default:
      return '';
  }
}
