/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButton,
  EuiText,
} from '@elastic/eui';
import { TOOL_TYPE } from '../../../../../common';

interface AgentSummaryModalProps {
  onClose: () => void;
  agentSummary: string;
}

export function AgentSummaryModal(props: AgentSummaryModalProps) {
  return (
    <EuiModal style={{ width: '70vw' }} onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Agent Summary</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {prettifyAgentSummary(props.agentSummary)}
        </EuiText>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButton onClick={props.onClose} fill>
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}

// Post-processing of the agent summary string returned from the LLM.
// Clean up any escape characters, highlight the tools mentioned, and other
// minor formatting / styling improvements
function prettifyAgentSummary(text: string): any {
  // rm backslashes before quotes
  let updatedText = text.replace(/\\"/g, '"');

  const tools = [
    ...(Object.values(TOOL_TYPE) as string[]),
    'query_planner_tool',
  ];
  updatedText = updatedText.replace(
    new RegExp(`\\b(${tools.join('|')})\\b`, 'g'),
    '**_$1_**'
  );

  return updatedText.split('\n').map((line, idx) => (
    <div key={idx} style={{ marginBottom: '1rem' }}>
      {line.split(/(\*\*.*?\*\*)/).map((segment, j) =>
        segment.startsWith('**_') && segment.endsWith('_**') ? (
          <strong key={j}>
            <em>{segment.slice(3, -3)}</em>
          </strong>
        ) : (
          segment
        )
      )}
    </div>
  ));
}
