/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiSpacer,
  EuiText,
  EuiPanel,
  EuiFlexItem,
  EuiCompressedSwitch,
  EuiFlexGroup,
  EuiIcon,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  Tool,
  TOOL_DESCRIPTION,
  TOOL_TYPE,
} from '../../../../../common';
import { QueryPlanningTool, WebSearchTool } from './tool_forms';

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

export function AgentTools({ agentForm, setAgentForm }: AgentToolsProps) {
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

  // automatically open the QPT for flow agents, if the model id is still missing
  useEffect(() => {
    if (agentForm?.type === AGENT_TYPE.FLOW) {
      const qptToolIndex = agentForm?.tools?.findIndex(
        (tool) => tool.type === TOOL_TYPE.QUERY_PLANNING
      );
      if (
        qptToolIndex !== undefined &&
        qptToolIndex !== -1 &&
        isEmpty(
          getIn(agentForm, `tools.${qptToolIndex}.parameters.model_id`) &&
            !openAccordionIndices.includes(qptToolIndex)
        )
      ) {
        addOpenAccordionIndex(qptToolIndex);
      }
    }
  }, [agentForm?.type]);

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

  const renderToolForm = (toolType: TOOL_TYPE): any => {
    const toolsForm = getIn(agentForm, 'tools', []) as Tool[];
    const toolIndex = toolsForm.findIndex((tool) => tool.type === toolType);
    switch (toolType) {
      case TOOL_TYPE.QUERY_PLANNING:
        return (
          <QueryPlanningTool
            agentForm={agentForm}
            setAgentForm={setAgentForm}
            toolIndex={toolIndex}
          />
        );
      case TOOL_TYPE.WEB_SEARCH:
        return (
          <WebSearchTool
            agentForm={agentForm}
            setAgentForm={setAgentForm}
            toolIndex={toolIndex}
          />
        );
      // In general, users should be using these in conjunction with conversational agents,
      // which will determine the tool inputs. So, we expose no explicit fields to configure on the form.
      // If it is needed, users can edit via JSON directly.
      // We don't persist unnecessary standalone components here, and dynamically generate here for consistency.
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
        const missingModelId = isEmpty(
          getIn(tools, `${index}.parameters.model_id`)
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
                    {toolType === TOOL_TYPE.QUERY_PLANNING &&
                      (!toolEnabled ||
                        (agentForm?.type === AGENT_TYPE.FLOW &&
                          missingModelId)) && (
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
      return TOOL_DESCRIPTION.INDEX_MAPPING as string;
    case TOOL_TYPE.LIST_INDEX:
      return TOOL_DESCRIPTION.LIST_INDEX as string;
    case TOOL_TYPE.SEARCH_INDEX:
      return TOOL_DESCRIPTION.SEARCH_INDEX as string;
    default:
      return 'No tool description available';
  }
}
