/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiBadge,
  EuiSmallButtonIcon,
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

  const [isSelectingAgent, setIsSelectingAgent] = useState<boolean>(false);
  const [agentOptions, setAgentOptions] = useState<
    EuiComboBoxOptionOption<string>[]
  >([]);

  // init with options once available from redux
  useEffect(() => {
    const options = Object.values(agents || {}).map((agent) => ({
      value: agent.id,
      label: agent.name,
    }));
    setAgentOptions(options);
  }, [agents]);

  const selectedAgent = agents?.[selectedAgentId];
  const displayName = selectedAgent?.name || 'Select agent';

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
          <EuiFlexGroup gutterSize="xs" direction="row" alignItems="center">
            <EuiFlexItem>
              {isSelectingAgent ? (
                <EuiComboBox
                  data-testid="agentSelector"
                  style={{ width: '300px' }}
                  singleSelection={{ asPlainText: true }}
                  options={agentOptions}
                  selectedOptions={
                    selectedAgentId
                      ? [
                          {
                            label: selectedAgent?.name || '',
                            value: selectedAgentId,
                          },
                        ]
                      : []
                  }
                  onChange={(options) => {
                    const value = getIn(options, '0.value', '') as string;
                    setFieldValue(AGENT_ID_PATH, value);
                    setFieldTouched(AGENT_ID_PATH, true);
                    setIsSelectingAgent(false);
                  }}
                  onBlur={() => setIsSelectingAgent(false)}
                  compressed
                  autoFocus
                  isClearable={false}
                />
              ) : (
                <EuiBadge
                  data-testid="agentBadge"
                  iconType={'generate'}
                  iconSide="left"
                  onClick={() => setIsSelectingAgent(true)}
                  color="hollow"
                  onClickAriaLabel="Open agent selector"
                  aria-label="Agent badge"
                >
                  {displayName}
                </EuiBadge>
              )}
            </EuiFlexItem>
            {selectedAgentId && selectedAgent && (
              <EuiFlexItem grow={false}>
                <EuiSmallButtonIcon
                  iconType="inspect"
                  onClick={() => setIsDetailsModalVisible(true)}
                  aria-label="View agent details"
                  data-testid="viewAgentDetailsButton"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      )}
    </>
  );
}
