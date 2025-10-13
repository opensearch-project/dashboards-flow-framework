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
        <EuiText>
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
