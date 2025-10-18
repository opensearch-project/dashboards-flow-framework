/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getIn } from 'formik';
import {
  Agent,
  AgentConfigParameters,
  customStringify,
} from '../../../../../common';
import { SimplifiedJsonField } from '../components';

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
  const parametersForm = getIn(
    agentForm,
    `parameters`,
    {}
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
    </>
  );
}
