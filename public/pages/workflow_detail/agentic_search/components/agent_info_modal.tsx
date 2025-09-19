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
  EuiText,
  EuiLink,
} from '@elastic/eui';
import { AGENTIC_SEARCH_DOCS_LINK } from '../../../../../common';

interface AgentInfoModalProps {
  onClose: () => void;
}

export function AgentInfoModal(props: AgentInfoModalProps) {
  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>What is Agentic Search?</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText>
          <p>
            Agentic Search uses AI to interpret natural language queries and
            help find the most relevant results in your OpenSearch cluster.
          </p>
          <h4>How it works:</h4>
          <ol>
            <li>Select the index containing your data</li>
            <li>Choose or create an AI agent to interpret your queries</li>
            <li>Enter your question in natural language</li>
            <li>
              The agent will take the question, generate a query, and return
              relevant results
            </li>
          </ol>
          <p>
            For more information and examples, check out the{' '}
            <EuiLink target="_blank" href={AGENTIC_SEARCH_DOCS_LINK}>
              documentation
            </EuiLink>{' '}
          </p>
        </EuiText>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={props.onClose} fill>
          Got it
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
