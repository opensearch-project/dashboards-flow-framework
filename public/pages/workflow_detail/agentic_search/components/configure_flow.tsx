/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiTitle,
  EuiPanel,
  EuiBetaBadge,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  AppState,
  registerAgent,
  updateAgent,
  useAppDispatch,
} from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { IndexSelector } from './index_selector';
import { AgentConfiguration } from './agent_configuration';
import { AgentInfoModal } from './agent_info_modal';

interface ConfigureFlowProps {
  uiConfig: WorkflowConfig | undefined;
}

const AGENT_ID_PATH = 'search.requestAgentId';
const NEW_AGENT_PLACEHOLDER = 'new_agent';
const EMPTY_AGENT = {
  type: AGENT_TYPE.FLOW,
  name: 'my_agent',
  description: '',
  tools: [],
};

/**
 * The base component for all of the agentic search flow configuration, including
 * index and agent selections
 */
export function ConfigureFlow(props: ConfigureFlowProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const { agents, loading: mlLoading } = useSelector(
    (state: AppState) => state.ml
  );
  const { loading: workflowsLoading } = useSelector(
    (state: AppState) => state.workflows
  );
  const { loading: opensearchLoading } = useSelector(
    (state: AppState) => state.opensearch
  );
  const isLoading = mlLoading || workflowsLoading || opensearchLoading;
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;
  const [agentForm, setAgentForm] = useState<Partial<Agent>>(EMPTY_AGENT);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAndUnsaved, setNewAndUnsaved] = useState<boolean>(false);
  const existingAndUnsaved =
    !isEmpty(selectedAgentId) &&
    selectedAgentId !== NEW_AGENT_PLACEHOLDER &&
    !isEqual(getIn(agents, selectedAgentId, {}), agentForm);
  const unsaved = newAndUnsaved || existingAndUnsaved;

  function onCreateNew() {
    setNewAndUnsaved(true);
  }
  function onDiscardDraft() {
    setNewAndUnsaved(false);
    setFieldValue(
      AGENT_ID_PATH,
      props.uiConfig?.search?.requestAgentId?.value || undefined
    );
  }
  function onRevertChanges() {
    const agent = getIn(agents, selectedAgentId, {});
    if (!isEmpty(agent)) {
      setAgentForm(agent);
    } else {
      setAgentForm(EMPTY_AGENT);
    }
  }
  async function onCreateAgent() {
    setIsSaving(true);
    try {
      const response = await dispatch(
        registerAgent({
          apiBody: agentForm,
          dataSourceId,
        })
      ).unwrap();
      if (response && response.agent && response.agent.id) {
        setFieldValue(AGENT_ID_PATH, response.agent.id);
      } else {
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
      setNewAndUnsaved(false);
    }
  }

  async function onUpdateAgent() {
    setIsSaving(true);
    try {
      await dispatch(
        updateAgent({
          agentId: selectedAgentId,
          body: agentForm,
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp) => {})
        .catch((e) => {
          // console.error(e);
        });
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {isModalOpen && <AgentInfoModal onClose={() => setIsModalOpen(false)} />}
      <EuiFlexGroup
        direction="column"
        gutterSize="m"
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h3>Configure flow</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ marginTop: '12px' }}>
              <EuiBetaBadge
                label="EXPERIMENTAL"
                tooltipContent="Configuring agentic search flows is an experimental feature and may change in future releases"
                size="s"
              />
            </EuiFlexItem>
            <EuiFlexItem
              grow={false}
              style={{ marginTop: '12px', marginLeft: '0px' }}
            >
              <EuiSmallButtonIcon
                aria-label="What is agentic search?"
                iconType="questionInCircle"
                onClick={() => setIsModalOpen(true)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem
          style={{
            overflowY: 'auto',
            scrollbarGutter: 'auto',
            scrollbarWidth: 'auto',
            overflowX: 'hidden',
          }}
        >
          <EuiPanel color="subdued" paddingSize="s">
            <EuiFlexGroup direction="column">
              <EuiFlexItem grow={false}>
                <IndexSelector />
              </EuiFlexItem>
              <EuiFlexItem
                style={{
                  overflow: 'hidden',
                }}
              >
                <AgentConfiguration
                  uiConfig={props.uiConfig}
                  onCreateNew={onCreateNew}
                  newAndUnsaved={newAndUnsaved}
                  setNewAndUnsaved={setNewAndUnsaved}
                  agentForm={agentForm}
                  setAgentForm={setAgentForm}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
        {unsaved && !isLoading && !isEmpty(props.uiConfig) && (
          <EuiFlexItem grow={false} style={{ marginTop: '0px' }}>
            <EuiFlexGroup direction="row" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiSmallButton
                  onClick={() => {
                    if (newAndUnsaved) {
                      onCreateAgent();
                    } else {
                      onUpdateAgent();
                    }
                  }}
                  fill
                  isDisabled={
                    isEqual(getIn(agents, selectedAgentId, {}), agentForm) ||
                    isEmpty(selectedAgentId) ||
                    !agentForm?.name?.trim()
                  }
                  isLoading={isSaving}
                >
                  {newAndUnsaved ? 'Create agent' : 'Update agent'}
                </EuiSmallButton>
              </EuiFlexItem>
              {existingAndUnsaved && (
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonEmpty onClick={onRevertChanges}>
                    Discard changes
                  </EuiSmallButtonEmpty>
                </EuiFlexItem>
              )}

              {newAndUnsaved && (
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonEmpty onClick={onDiscardDraft}>
                    Discard draft
                  </EuiSmallButtonEmpty>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
