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
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPopover,
  EuiContextMenuItem,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiTextArea,
} from '@elastic/eui';
import { Agent, MODEL_STATE, Tool, TOOL_TYPE } from '../../../../../common';
import { AppState } from '../../../../store';

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
  'You are an OpenSearch Query DSL generation assistant, translating natural language questions to OpenSeach DSL Queries';

export function AgentTools({ agentForm, setAgentForm }: AgentToolsProps) {
  // get model options if a tool that requires a model is needed
  const { models } = useSelector((state: AppState) => state.ml);
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
  const tools = agentForm?.tools || [];

  const addTool = (toolType: TOOL_TYPE) => {
    const newTool: Tool = {
      ...EMPTY_TOOL,
      type: toolType,
      parameters: toolType ? getDefaultParameters(toolType) : {},
    };
    const updatedTools = [...tools, newTool];
    setAgentForm({ ...agentForm, tools: updatedTools });

    // Set the newly added tool accordion to be open
    setTimeout(() => {
      setOpenAccordionIndex(updatedTools.length - 1);
    }, 100);
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
        [parameterName]: parameterValue,
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
        const selectedModelId = toolForm?.parameters?.model_id;
        const responseFilter = toolForm?.parameters?.response_filter;
        const systemPrompt = toolForm?.parameters?.system_prompt;
        return (
          <>
            <EuiFormRow label="Model">
              <EuiSelect
                options={modelOptions}
                value={selectedModelId}
                // // TODO: consider debouncing or only doing
                // // for onBlur for text fields with constant changes to improve performance
                onChange={(e) => {
                  updateParameterValue('model_id', e.target.value, index);
                }}
                aria-label="Select model"
                placeholder="Select a model"
                hasNoInitialSelection={isEmpty(selectedModelId)}
                fullWidth
              />
            </EuiFormRow>
            <EuiFormRow label="Response filter">
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
              />
            </EuiFormRow>
            <EuiFormRow label="System prompt">
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
          </>
        );
      case TOOL_TYPE.SEARCH_INDEX:
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
              buttonContent={
                <EuiFlexGroup
                  justifyContent="spaceBetween"
                  gutterSize="s"
                  style={{ width: '350px' }}
                >
                  <EuiFlexItem>
                    <EuiText size="s">
                      {TOOL_TYPE_OPTIONS.find(
                        (option) => option.value === tool.type
                      )?.text ||
                        tool?.type ||
                        'Unknown tool'}
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      aria-label="Remove tool"
                      iconType="trash"
                      color="danger"
                      onClick={() => {
                        removeTool(index);
                      }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
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
            onClick={() => setIsPopoverOpen(true)}
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
            >
              {option.text}
            </EuiContextMenuItem>
          ))}
        </div>
      </EuiPopover>
    </>
  );
}
