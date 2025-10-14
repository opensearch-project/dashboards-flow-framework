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
        {/**
         * Handle newline formatting, as the agent response will likely have plaintext "\n" characters.
         */}
        <EuiText style={{ whiteSpace: 'pre-wrap' }}>
          <i>{props.agentSummary}</i>
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
