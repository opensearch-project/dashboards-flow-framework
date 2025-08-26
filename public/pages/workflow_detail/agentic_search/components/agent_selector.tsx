/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
  EuiButtonEmpty,
} from '@elastic/eui';
import {
  AppState,
  getAgent,
  searchAgents,
  useAppDispatch,
} from '../../../../store';
import {
  FETCH_ALL_QUERY_LARGE,
  WorkflowFormValues,
} from '../../../../../common';
import { getDataSourceId } from '../../../../utils';
import { CreateAgentModal } from './create_agent_modal';
import { AgentDetailsModal } from './agent_details_modal';
import { isEmpty } from 'lodash';

interface AgentSelectorProps {
  onCreateNew: () => void;
}

export function AgentSelector(props: AgentSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const selectedAgentId = getIn(values, 'search.agentId', '') as string;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(
    false
  );

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
          <EuiToolTip content="Choose an AI agent that will interpret your natural language query and convert it to a search query">
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
          <CreateAgentModal onClose={() => setIsModalVisible(false)} />
        )}
        {isDetailsModalVisible && selectedAgentId && (
          <AgentDetailsModal
            onClose={() => setIsDetailsModalVisible(false)}
            agentId={selectedAgentId}
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
                  setFieldTouched('search.agentId', true);
                }
              }}
              aria-label="Select agent"
              placeholder="Select an agent"
              hasNoInitialSelection={true}
              fullWidth
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={props.onCreateNew}
              iconType="plusInCircle"
            >
              Create new
            </EuiButtonEmpty>
          </EuiFlexItem>
          {!isEmpty(selectedAgentId) && (
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="s"
                onClick={async () => {
                  await dispatch(
                    getAgent({ agentId: selectedAgentId, dataSourceId })
                  )
                    .unwrap()
                    .then(() => {
                      setIsDetailsModalVisible(true);
                    });
                }}
              >
                View details
              </EuiButtonEmpty>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </>
    </EuiFormRow>
  );
}
