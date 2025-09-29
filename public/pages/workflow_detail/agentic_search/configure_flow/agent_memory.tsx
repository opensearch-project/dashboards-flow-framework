/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import { Agent, AGENT_MEMORY_TYPE } from '../../../../../common';

interface AgentMemoryProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const CONVERSATION_INDEX_DISPLAY_TEXT = 'Conversation index';

/**
 * The general component containing all of the memory-related fields for an agent.
 */
export function AgentMemory({ agentForm, setAgentForm }: AgentMemoryProps) {
  const memoryForm = getIn(agentForm, 'memory.type', '');
  const memoryOptions = Object.values(AGENT_MEMORY_TYPE).map((memoryType) => ({
    value: memoryType,
    text:
      memoryType === AGENT_MEMORY_TYPE.CONVERSATION_INDEX
        ? CONVERSATION_INDEX_DISPLAY_TEXT
        : memoryType,
  }));
  const memoryFound = memoryOptions.some(
    (memory) => memory.value === memoryForm
  );
  const memoryEmpty = isEmpty(memoryForm);

  return (
    <EuiFlexGroup direction="row" gutterSize="s" alignItems="center">
      <EuiFlexItem>
        <EuiSelect
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
            setAgentForm({
              ...agentForm,
              memory: {
                ...agentForm?.memory,
                type: (e.target.value as string) as AGENT_MEMORY_TYPE,
              },
            });
          }}
          aria-label="Select memory type"
          placeholder="Select a memory type"
          hasNoInitialSelection={true}
          isInvalid={!memoryFound && !memoryEmpty}
          fullWidth
          compressed
        />
      </EuiFlexItem>
      {memoryFound && (
        <EuiFlexItem grow={false}>
          <EuiSmallButtonEmpty
            color="danger"
            onClick={() => {
              setAgentForm({
                ...agentForm,
                memory: undefined,
              });
            }}
          >
            Remove
          </EuiSmallButtonEmpty>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
