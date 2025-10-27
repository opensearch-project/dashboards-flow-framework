/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getIn } from 'formik';
import { parseStringOrJson } from '../../../../../utils';
import { Agent, Tool } from '../../../../../../common';

// reusable fn for updating single parameter values for a given tool (tool is determined based on index)
export function updateParameterValue(
  agentForm: Partial<Agent>,
  setAgentForm: (agentForm: Partial<Agent>) => void,
  toolIndex: number,
  parameterName: string,
  parameterValue: string
) {
  const toolsForm = getIn(agentForm, 'tools');
  const toolForm = getIn(agentForm, `tools.${toolIndex}`) as Tool;
  const updatedTool = {
    ...toolForm,
    parameters: {
      ...toolForm.parameters,
      [parameterName]: parseStringOrJson(parameterValue),
    },
  };
  setAgentForm({
    ...agentForm,
    tools: toolsForm.map((tool: Tool, i: number) =>
      i === toolIndex ? updatedTool : tool
    ),
  });
}
