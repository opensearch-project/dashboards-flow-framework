/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiToolTip,
  EuiIcon,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiTitle,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  customStringify,
  EMPTY_AGENT,
  NEW_AGENT_PLACEHOLDER,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { AppState } from '../../../../store';
import { AgentTools } from './agent_tools';
import { SimplifiedJsonField } from './simplified_json_field';

interface AgentConfigurationProps {
  uiConfig: WorkflowConfig | undefined;
  onCreateNew: () => void;
  newAndUnsaved: boolean;
  setNewAndUnsaved: (newAndUnsaved: boolean) => void;
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

const AGENT_ID_PATH = 'search.requestAgentId';
const AGENT_TYPE_OPTIONS = Object.values(AGENT_TYPE).map((agentType) => ({
  value: agentType,
  text: capitalize(agentType),
}));
/**
 * Enum for agent config toggle options
 */
enum CONFIG_MODE {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

/**
 * Configure agents. Select from existing agents, update existing agents, or create new agents altogether.
 */
export function AgentConfiguration(props: AgentConfigurationProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const { agents } = useSelector((state: AppState) => state.ml);
  const selectedAgentId = getIn(values, AGENT_ID_PATH, '') as string;

  const { id, ...agentFormNoId } = props.agentForm;
  const [configModeSelected, setConfigModeSelected] = useState<CONFIG_MODE>(
    CONFIG_MODE.SIMPLE
  );
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);

  // listen to agent ID changes. update the agent config form values appropriately
  useEffect(() => {
    const selectedAgentIdForm = getIn(values, AGENT_ID_PATH, '') as string;
    const agent = agents[selectedAgentIdForm];
    if (!isEmpty(selectedAgentIdForm) && !isEmpty(agent)) {
      props.setAgentForm(agent);
    } else {
      props.setAgentForm(EMPTY_AGENT);
    }
  }, [getIn(values, AGENT_ID_PATH), agents]);

  // Populate the agent options in the dropdown on initial load
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
      }))
    );
  }, [agents]);

  // get initial agent options for the dropdown
  const [agentOptions, setAgentOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    setAgentOptions(
      Object.values(agents || {}).map((agent) => ({
        value: agent.id,
        text: agent.name,
      }))
    );
  }, [agents]);
  const agentTypeInvalid = !Object.values(AGENT_TYPE).includes(
    props.agentForm.type as AGENT_TYPE
  );

  const handleModeSwitch = (queryMode: string) => {
    // TODO: we may need to handle more logic in the future as agent config fields grow, if we need further custom rendering etc.
    setConfigModeSelected(queryMode as CONFIG_MODE);
  };

  // update different agent options in the dropdown based on if a user is creating a new agent or not
  useEffect(() => {
    if (props.newAndUnsaved) {
      setFieldValue(AGENT_ID_PATH, NEW_AGENT_PLACEHOLDER);
      setFieldTouched(AGENT_ID_PATH, true);
      setAgentOptions([
        ...agentOptions,
        {
          value: NEW_AGENT_PLACEHOLDER,
          text: 'New agent (unsaved)',
        },
      ]);
      // new and unsaved was triggered to false (either by user discarding the changes, or a new agent created).
      // either way, we want to remove the placeholder option in the dropdown.
    } else {
      setAgentOptions(
        agentOptions.filter((option) => option.value !== NEW_AGENT_PLACEHOLDER)
      );
    }
  }, [props.newAndUnsaved]);

  return (
    <>
      <EuiFlexGroup
        direction="row"
        justifyContent="spaceBetween"
        alignItems="center"
        style={{ paddingLeft: '2px' }}
      >
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" gutterSize="none" alignItems="center">
            <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
              <EuiIcon type="generate" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h5>Agent</h5>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Choose an AI agent that will interpret your natural language query and convert it to a search query">
                <EuiIcon
                  type="questionInCircle"
                  color="subdued"
                  style={{ marginLeft: '4px' }}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" gutterSize="none">
            {!props.newAndUnsaved && (
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={() => {
                    props.onCreateNew();
                  }}
                  iconType="plusInCircle"
                >
                  Create new
                </EuiButtonEmpty>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                buttonSize="compressed"
                legend="Config Mode"
                options={[
                  {
                    id: CONFIG_MODE.SIMPLE,
                    label: 'Form',
                  },
                  {
                    id: CONFIG_MODE.ADVANCED,
                    label: 'JSON',
                  },
                ]}
                idSelected={configModeSelected}
                onChange={handleModeSwitch}
                isFullWidth={false}
                style={{ marginLeft: '8px' }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={{
          height: '100%',
          //gap: '16px',
          //marginTop: '4px',
          overflow: 'hidden',
        }}
      >
        <EuiFlexItem>
          <EuiSelect
            options={agentOptions}
            value={selectedAgentId}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== NEW_AGENT_PLACEHOLDER) {
                props.setNewAndUnsaved(false);
              }
              if (value) {
                setFieldValue(AGENT_ID_PATH, value);
                setFieldTouched(AGENT_ID_PATH, true);
              }
            }}
            aria-label="Select agent"
            placeholder="Select an agent"
            hasNoInitialSelection={true}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem>
          {configModeSelected === CONFIG_MODE.SIMPLE ? (
            <EuiFlexGroup direction="row" gutterSize="s">
              <EuiFlexItem>
                <EuiFormRow label="Name" fullWidth>
                  <EuiFieldText
                    value={props.agentForm.name}
                    onChange={(e) =>
                      props.setAgentForm({
                        ...props.agentForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter agent name"
                    aria-label="Enter agent name"
                    fullWidth
                    maxLength={50}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  label="Type"
                  isInvalid={agentTypeInvalid}
                  error={`Unknown agent type: '${props.agentForm?.type}'`}
                  fullWidth
                >
                  <EuiSelect
                    options={AGENT_TYPE_OPTIONS}
                    value={agentTypeInvalid ? undefined : props.agentForm?.type}
                    onChange={(e) => {
                      props.setAgentForm({
                        ...props.agentForm,
                        type: e.target.value as AGENT_TYPE,
                      });
                    }}
                    aria-label="Agent type"
                    placeholder="Agent type"
                    fullWidth
                    isInvalid={agentTypeInvalid}
                    hasNoInitialSelection={true}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            <SimplifiedJsonField
              value={customStringify(agentFormNoId)}
              onBlur={(e) => {
                try {
                  const agentFormUpdated = JSON.parse(e);
                  props.setAgentForm({
                    id: props.agentForm.id,
                    ...agentFormUpdated,
                  });
                  setJsonError(undefined);
                } catch (error) {
                  setJsonError(
                    'Invalid JSON: ' + (error as Error)?.message || ''
                  );
                }
              }}
              editorHeight="800px"
              isInvalid={jsonError !== undefined}
              helpText="Edit the full agent configuration directly"
            />
          )}
          <EuiSpacer size="m" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFormRow label="Description" fullWidth>
            <EuiTextArea
              value={props.agentForm.description}
              onChange={(e) =>
                props.setAgentForm({
                  ...props.agentForm,
                  description: e.target.value,
                })
              }
              placeholder="Enter description"
              aria-label="Enter description"
              rows={2}
              fullWidth
              compressed
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Tools" fullWidth>
            <AgentTools
              agentForm={props.agentForm}
              setAgentForm={props.setAgentForm}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
