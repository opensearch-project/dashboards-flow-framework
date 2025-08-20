/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSelect,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import { AppState, searchAgents, useAppDispatch } from '../../../store';
import { FETCH_ALL_QUERY_LARGE, WorkflowFormValues } from '../../../../common';
import { getDataSourceId } from '../../../utils/utils';
import { SimplifiedAgentCreationModal } from './simplified_agent_creation_modal';

interface SimplifiedAgentSelectorProps {}

export function SimplifiedAgentSelector(props: SimplifiedAgentSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const selectedAgentId = getIn(values, 'search.agentId');

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { agents } = useSelector((state: AppState) => state.ml);

  // Fetch agents on initial load
  useEffect(() => {
    dispatch(searchAgents({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
  }, []);

  // Create agent options for the dropdown
  const agentOptions = Object.values(agents || {}).map((agent) => ({
    value: agent.id,
    text: agent.name,
  }));

  // Render normal state
  return (
    <EuiFormRow
      label={
        <>
          Agent
          <EuiToolTip content="Select or create an AI agent that will interpret your natural language query and convert it to a search query">
            <EuiIcon
              type="questionInCircle"
              color="subdued"
              style={{ marginLeft: '4px' }}
            />
          </EuiToolTip>
        </>
      }
      fullWidth
    >
      <>
        {isModalVisible && (
          <SimplifiedAgentCreationModal
            onClose={() => setIsModalVisible(false)}
          />
        )}
        <EuiFlexGroup gutterSize="s" alignItems="center">
          <EuiFlexItem>
            <EuiSelect
              options={agentOptions}
              value={selectedAgentId}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setFieldValue('search.agentId', value);
                }
              }}
              aria-label="Select agent"
              placeholder="Select an agent"
              hasNoInitialSelection={isEmpty(selectedAgentId)}
              fullWidth
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => setIsModalVisible(true)}
              iconType="plusInCircle"
            >
              Create new
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </EuiFormRow>
  );
}
