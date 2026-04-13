/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiSelect,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import {
  Agent,
  AGENT_MEMORY_TYPE,
  AgentMemory as AgentMemoryType,
} from '../../../../../common';
import { AppState } from '../../../../store';

interface AgentMemoryProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
  readOnly?: boolean;
}

const CONVERSATION_INDEX_DISPLAY_TEXT = 'Conversation index';
const AGENTIC_MEMORY_DISPLAY_TEXT = 'Agentic memory';

/**
 * The general component containing all of the memory-related fields for an agent.
 */
export function AgentMemory({
  agentForm,
  setAgentForm,
  readOnly,
}: AgentMemoryProps) {
  const memoryForm = getIn(agentForm, 'memory.type', '');
  const memoryContainerId = getIn(agentForm, 'memory.memory_container_id', '');
  const { memoryContainers } = useSelector((state: AppState) => state.ml);
  const containerOptions = Object.values(memoryContainers || {}).map(
    (container) => ({
      value: container.id,
      text: container.name || container.id,
    })
  );
  const memoryOptions = Object.values(AGENT_MEMORY_TYPE).map((memoryType) => ({
    value: memoryType,
    text:
      memoryType === AGENT_MEMORY_TYPE.CONVERSATION_INDEX
        ? CONVERSATION_INDEX_DISPLAY_TEXT
        : memoryType === AGENT_MEMORY_TYPE.AGENTIC_MEMORY
        ? AGENTIC_MEMORY_DISPLAY_TEXT
        : memoryType,
  }));
  const memoryFound = memoryOptions.some(
    (memory) => memory.value === memoryForm
  );
  const memoryEmpty = isEmpty(memoryForm);

  return (
    <>
      <EuiFlexGroup direction="row" gutterSize="s" alignItems="center">
        <EuiFlexItem>
          <EuiSelect
            key={memoryForm}
            options={
              memoryFound || memoryEmpty
                ? memoryOptions
                : [
                    ...memoryOptions,
                    {
                      value: memoryForm,
                      text: `Unknown memory type: ${memoryForm}`,
                    },
                  ]
            }
            value={memoryForm}
            onChange={(e) => {
              const newType = e.target.value as AGENT_MEMORY_TYPE;
              const memory: AgentMemoryType = { type: newType };
              if (
                newType === AGENT_MEMORY_TYPE.AGENTIC_MEMORY &&
                memoryContainerId
              ) {
                memory.memory_container_id = memoryContainerId;
              }
              setAgentForm({ ...agentForm, memory });
            }}
            aria-label="Select memory type"
            placeholder="Select a memory type"
            hasNoInitialSelection={true}
            isInvalid={!memoryFound && !memoryEmpty}
            disabled={readOnly}
            fullWidth
            compressed
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {memoryForm === AGENT_MEMORY_TYPE.AGENTIC_MEMORY && (
        <>
          <EuiSpacer size="s" />
          <EuiFormRow
            label={
              <EuiFlexGroup gutterSize="xs" alignItems="center">
                <EuiFlexItem grow={false}>Memory container</EuiFlexItem>
                <EuiFlexItem grow={false} style={{ marginTop: '-2px' }}>
                  <EuiToolTip
                    content={
                      'Memory container cannot be changed after agent creation.'
                    }
                  >
                    <EuiIcon
                      type={readOnly ? 'lock' : 'lockOpen'}
                      size="s"
                      color="subdued"
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            fullWidth
          >
            <EuiSelect
              options={containerOptions}
              value={memoryContainerId}
              onChange={(e) => {
                const value = e.target.value;
                const memory: AgentMemoryType = {
                  type: AGENT_MEMORY_TYPE.AGENTIC_MEMORY,
                };
                if (value) {
                  memory.memory_container_id = value;
                }
                setAgentForm({ ...agentForm, memory });
              }}
              aria-label="Select memory container"
              hasNoInitialSelection={isEmpty(memoryContainerId)}
              disabled={readOnly}
              fullWidth
              compressed
            />
          </EuiFormRow>
        </>
      )}
    </>
  );
}
