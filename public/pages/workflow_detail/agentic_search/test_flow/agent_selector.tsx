/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSmallButtonIcon,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { AppState } from '../../../../store';
import { AGENT_ID_PATH, WorkflowFormValues } from '../../../../../common';
import { AgentDetailsModal } from './agent_details_modal';

export function AgentSelector() {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const selectedAgentId = getIn(values, AGENT_ID_PATH);
  const { agents } = useSelector((state: AppState) => state.ml);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(
    false
  );

  const [agentOptions, setAgentOptions] = useState<
    EuiSuperSelectOption<string>[]
  >([]);

  // init with options once available from redux
  useEffect(() => {
    const options = Object.values(agents || {}).map((agent) => ({
      value: agent.id,
      text: agent.name,
      inputDisplay: agent.name,
      dropdownDisplay: (
        <>
          <EuiText size="s">
            {agent.name}
            {!isEmpty(agent.description) && (
              <EuiText size="xs" color="subdued">
                <span
                  style={{
                    display: 'block',
                    width: '100%',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <i> {agent.description?.trim()}</i>
                </span>
              </EuiText>
            )}
          </EuiText>
        </>
      ),
    }));
    setAgentOptions(options);
  }, [agents]);

  const selectedAgent = agents?.[selectedAgentId];

  return (
    <>
      {agentOptions.length > 0 && (
        <>
          {isDetailsModalVisible && selectedAgent && (
            <AgentDetailsModal
              onClose={() => setIsDetailsModalVisible(false)}
              agent={selectedAgent}
            />
          )}
          <EuiSuperSelect
            data-testid="agentSelector"
            prepend="Agent"
            append={
              selectedAgentId && selectedAgent ? (
                <EuiSmallButtonIcon
                  iconType="inspect"
                  onClick={() => setIsDetailsModalVisible(true)}
                  aria-label="View agent details"
                  data-testid="viewAgentDetailsButton"
                />
              ) : undefined
            }
            options={agentOptions}
            valueOfSelected={selectedAgentId}
            onChange={(value) => {
              setFieldValue(AGENT_ID_PATH, value);
              setFieldTouched(AGENT_ID_PATH, true);
            }}
            placeholder="Select an agent"
            compressed
            fullWidth
          />
        </>
      )}
    </>
  );
}
