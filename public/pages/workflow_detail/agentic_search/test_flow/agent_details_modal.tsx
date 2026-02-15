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
  EuiCodeBlock,
  EuiSmallButton,
} from '@elastic/eui';
import { Agent, customStringify } from '../../../../../common';

const MAX_AGENT_TITLE_WIDTH = '50vw';

interface AgentDetailsModalProps {
  onClose: () => void;
  agent: Agent;
}

export function AgentDetailsModal(props: AgentDetailsModalProps) {
  return (
    <EuiModal style={{ width: '70vw' }} onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle
          style={{
            maxWidth: MAX_AGENT_TITLE_WIDTH,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {`Agent '${props.agent.name || props.agent.id}'`}
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiCodeBlock
          language="json"
          fontSize="s"
          paddingSize="m"
          isCopyable
          overflowHeight={400}
        >
          {customStringify(props.agent)}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButton onClick={props.onClose} fill>
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
