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
  EuiButton,
  EuiCodeBlock,
} from '@elastic/eui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { customStringify } from '../../../../../common';

interface AgentDetailsModalProps {
  onClose: () => void;
  agentId: string;
}

export function AgentDetailsModal(props: AgentDetailsModalProps) {
  const { onClose, agentId } = props;

  const { agents } = useSelector((state: AppState) => state.ml);
  const agent = agents[agentId];

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Agent Details</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {' '}
        <EuiCodeBlock
          language="json"
          fontSize="s"
          paddingSize="m"
          isCopyable
          overflowHeight={400}
        >
          {customStringify(agent)}
        </EuiCodeBlock>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={onClose} fill>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
