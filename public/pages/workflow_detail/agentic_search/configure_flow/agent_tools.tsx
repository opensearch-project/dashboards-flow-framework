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
  EuiFieldText,
  EuiTextArea,
  EuiRadioGroup,
  EuiLink,
  EuiFlexItem,
  EuiCompressedSwitch,
  EuiFlexGroup,
  EuiIcon,
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
import {
  NoDeployedModelsCallout,
  NoSearchTemplatesCallout,
} from '../components';

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

  // Persist state for each tool accordion. Automatically open/close based on users
  // enabling/disabling the individual tools.
  const [openAccordionIndices, setOpenAccordionIndices] = useState<number[]>(
    []
  );
  function addOpenAccordionIndex(index: number): void {
    setOpenAccordionIndices([...openAccordionIndices, index]);
  }
  function removeOpenAccordionIndex(index: number): void {
    setOpenAccordionIndices(
      openAccordionIndices.filter((accordionIndex) => accordionIndex !== index)
    );
  }

  // Persist state for each search template accordion. Only support one at a time
  const [openTemplateAccordionIndex, setOpenTemplateAccordionIndex] = useState<
    number | undefined
  >(undefined);

  // Display the list of available configurable tools. Note we hide certain tools for flow agents,
  // and also display any custom/unknown/unsupported tools, if configured separately via JSON editor
  // or created outside of the plugin.
  const tools = agentForm?.tools || [];
  const knownToolTypes =
    agentForm?.type === AGENT_TYPE.FLOW
      ? [TOOL_TYPE.QUERY_PLANNING]
      : Object.values(TOOL_TYPE);
  const availableToolTypes = [
    ...knownToolTypes,
    ...tools
      .filter((tool) => !knownToolTypes.includes(tool.type))
      .map((tool) => tool.type),
  ];

  const addTool = (toolType: TOOL_TYPE) => {
    const newTool: Tool = {
      ...EMPTY_TOOL,
      type: toolType,
      parameters: toolType ? getDefaultParameters(toolType) : {},
    };
    const updatedTools = [...tools, newTool];
    setAgentForm({ ...agentForm, tools: updatedTools });
  };

  const removeTool = (toolType: TOOL_TYPE) => {
    const updatedTools = tools.filter((tool) => tool.type !== toolType);
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
    parameterValue: string,
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

  const renderToolForm = (toolType: TOOL_TYPE): any => {
    const toolsForm = getIn(agentForm, 'tools', []) as Tool[];

    const toolIndex = toolsForm.findIndex((tool) => tool.type === toolType);
    const toolForm = getIn(agentForm, `tools.${toolIndex}`) as Tool;
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
            toolIndex
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
            toolIndex
          );
        };
        const removeSearchTemplate = (templateIndex: number) => {
          const updatedTemplates = searchTemplatesForm.filter(
            (_: SearchTemplateField, i: number) => i !== templateIndex
          );
          updateParameterValue(
            'search_templates',
            JSON.stringify(updatedTemplates),
            toolIndex
          );
        };

        return (
          <>
            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                <i>{getToolDescription(toolType)}</i>
              </EuiText>
            </EuiFlexItem>
            <EuiSpacer size="s" />
            <EuiFormRow
              label="Model"
              data-testid="queryPlanningModelField"
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
                      updateParameterValue(
                        'model_id',
                        e.target.value,
                        toolIndex
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
                  updateParameterValue('generation_type', id, toolIndex);
                }}
                compressed
                data-testid="generationTypeRadioGroup"
              />
            </EuiFormRow>
            {generationType === GENERATION_TYPE.SEARCH_TEMPLATES && (
              <>
                <EuiSpacer size="s" />
                <div>
                  {searchTemplatesForm.length === 0 && (
                    <NoSearchTemplatesCallout />
                  )}
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
                    data-testid="addTemplateButton"
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
            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                <i>{getToolDescription(toolType)}</i>
              </EuiText>
            </EuiFlexItem>
            <EuiSpacer size="s" />
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
                  updateParameterValue('engine', e.target.value, toolIndex);
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
          <EuiFlexItem grow={false}>
            <EuiText size="xs" color="subdued">
              <i>{getToolDescription(toolType)}</i>
            </EuiText>
          </EuiFlexItem>
        );
      default:
        return (
          <EuiText size="xs" color="subdued">
            Unsupported tool type. Please edit directly with the JSON editor.
          </EuiText>
        );
    }
  };

  return (
    <>
      {availableToolTypes.map((toolType, index) => {
        const accordionTitle =
          TOOL_TYPE_OPTIONS.find((option) => option.value === toolType)?.text ||
          toolType ||
          'Unknown tool';
        const toolEnabled = !isEmpty(
          tools.find((tool) => tool.type === toolType)
        );
        return (
          <div key={`tool_${toolType || index}`}>
            <EuiPanel
              key={toolType || index}
              color="transparent"
              paddingSize="s"
              style={{ paddingBottom: '0px' }}
            >
              <EuiAccordion
                id={`tool-accordion-${index}`}
                arrowDisplay="left"
                extraAction={
                  <EuiFlexGroup
                    direction="row"
                    alignItems="center"
                    gutterSize="s"
                  >
                    {toolType === TOOL_TYPE.QUERY_PLANNING && !toolEnabled && (
                      <EuiFlexItem grow={false}>
                        <EuiIcon type="alert" color="warning" />
                      </EuiFlexItem>
                    )}
                    <EuiFlexItem grow={false}>
                      <EuiCompressedSwitch
                        label="Enable"
                        checked={toolEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked as boolean;
                          if (checked) {
                            addTool(toolType);
                            addOpenAccordionIndex(index);
                          } else {
                            removeTool(toolType);
                            removeOpenAccordionIndex(index);
                          }
                        }}
                        data-testid={`${toolType.toLowerCase()}ToolToggle`}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                buttonContent={
                  <EuiFlexGroup direction="row" gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">{accordionTitle}</EuiText>
                    </EuiFlexItem>
                    {toolType === TOOL_TYPE.QUERY_PLANNING && (
                      <EuiFlexItem grow={false}>
                        <EuiText size="s">
                          <i> - required</i>
                        </EuiText>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                }
                paddingSize="s"
                forceState={
                  openAccordionIndices.includes(index) ? 'open' : 'closed'
                }
                onToggle={(isOpen) => {
                  if (isOpen) {
                    addOpenAccordionIndex(index);
                  } else {
                    removeOpenAccordionIndex(index);
                  }
                }}
              >
                {renderToolForm(toolType)}
              </EuiAccordion>
              <EuiSpacer size="s" />
            </EuiPanel>
            <EuiSpacer size="s" />
          </div>
        );
      })}
    </>
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
      return 'No tool description available';
  }
}
