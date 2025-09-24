/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getIn } from 'formik';
import { EuiLink, EuiText } from '@elastic/eui';
import {
  Agent,
  AgentConfigParameters,
  customStringify,
  MCP_AGENT_CONFIG_DOCS_LINK,
} from '../../../../../common';
import { SimplifiedJsonField } from './simplified_json_field';
import { sanitizeObjInput } from '../../../../utils';

interface AgentParametersProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
}

/**
 * The general component containing all of the extra parameters for an agent.
 */
export function AgentParameters({
  agentForm,
  setAgentForm,
}: AgentParametersProps) {
  const parametersForm = sanitizeObjInput(
    getIn(agentForm, `parameters`)
  ) as AgentConfigParameters;

  return (
    <>
      <SimplifiedJsonField
        value={customStringify(parametersForm)}
        onBlur={(e) => {
          try {
            const parametersUpdated = JSON.parse(e);
            setAgentForm({
              ...agentForm,
              parameters: parametersUpdated,
            });
          } catch (error) {}
        }}
        editorHeight="120px"
      />
      <EuiText
        size="xs"
        color="subdued"
        style={{ marginLeft: '4px', marginTop: '4px' }}
      >
        <i>
          Interested in integrating with MCP servers? Check out the example
          agent configuration{' '}
          <EuiLink href={MCP_AGENT_CONFIG_DOCS_LINK} target="_blank">
            here
          </EuiLink>{' '}
        </i>
      </EuiText>
    </>
  );
}
