/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiTextArea,
  EuiSmallButtonEmpty,
  EuiPopover,
  EuiContextMenuItem,
} from '@elastic/eui';
import { Agent, Tool } from '../../../../../common';
import { TOOL_TYPE } from '../../../../../common/constants';

interface AgentToolsProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const EMPTY_TOOL: Tool = {
  type: '',
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

export function AgentTools({ agentForm, setAgentForm }: AgentToolsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<
    number | undefined
  >(undefined);
  const tools = agentForm?.tools || [];

  const addTool = (toolType: string = '') => {
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

  const updateTool = (index: number, updatedTool: Tool) => {
    const updatedTools = [...tools];
    updatedTools[index] = updatedTool;
    setAgentForm({ ...agentForm, tools: updatedTools });
  };

  const getDefaultParameters = (toolType: string) => {
    switch (toolType) {
      case TOOL_TYPE.QUERY_PLANNING:
        return {
          model_id: '',
          response_filter: '$.output.message.content[0].text',
        };
      case TOOL_TYPE.SEARCH_INDEX:
        return {};
      default:
        return {};
    }
  };

  return (
    <>
      {tools.map((tool, index) => (
        <div key={index}>
          <EuiAccordion
            id={`tool-accordion-${index}`}
            buttonContent={
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem>
                  <EuiText size="s">
                    {
                      TOOL_TYPE_OPTIONS.find(
                        (option) => option.value === tool.type
                      )?.text
                    }
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
            <EuiFormRow label="Description">
              <EuiTextArea
                value={tool.description || ''}
                onChange={(e) => {
                  updateTool(index, {
                    ...tool,
                    description: e.target.value,
                  });
                }}
                rows={2}
                fullWidth
              />
            </EuiFormRow>
            <EuiSpacer size="s" />
            <EuiFormRow label="Parameters">
              <EuiTextArea
                value={JSON.stringify(tool.parameters || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsedParams = JSON.parse(e.target.value);
                    updateTool(index, {
                      ...tool,
                      parameters: parsedParams,
                    });
                  } catch (error) {
                    // If JSON is invalid, don't update
                  }
                }}
                rows={5}
                fullWidth
              />
            </EuiFormRow>
          </EuiAccordion>
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
