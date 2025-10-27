/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getIn } from 'formik';
import {
  EuiSpacer,
  EuiText,
  EuiFormRow,
  EuiLink,
  EuiFlexItem,
  EuiFieldText,
} from '@elastic/eui';
import {
  Agent,
  Tool,
  TOOL_DESCRIPTION,
  WEB_SEARCH_TOOL_DOCS_LINK,
} from '../../../../../../common';
import { updateParameterValue } from './utils';

interface WebSearchToolProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
  toolIndex: number;
}

export function WebSearchTool(props: WebSearchToolProps) {
  const toolForm = getIn(props.agentForm, `tools.${props.toolIndex}`) as Tool;
  const engine = toolForm?.parameters?.engine;

  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiText size="xs" color="subdued">
          <i>{TOOL_DESCRIPTION.WEB_SEARCH}</i>
        </EuiText>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Engine"
        labelAppend={
          <EuiText size="xs">
            <EuiLink href={WEB_SEARCH_TOOL_DOCS_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiText>
        }
        fullWidth
      >
        <EuiFieldText
          value={engine}
          onChange={(e) => {
            updateParameterValue(
              props.agentForm,
              props.setAgentForm,
              props.toolIndex,
              'engine',
              e.target.value
            );
          }}
          aria-label="Specify the engine"
          placeholder="Search engine - for example, duckduckgo"
          fullWidth
          compressed
        />
      </EuiFormRow>
    </>
  );
}
