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
  EuiLink,
} from '@elastic/eui';
import { AGENTIC_SEARCH_DOCS_LINK } from '../../../../../common';

interface AgenticSearchInfoModalProps {
  onClose: () => void;
}

export function AgenticSearchInfoModal(props: AgenticSearchInfoModalProps) {
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
            <li>Choose or create an AI agent to interpret your queries</li>
            <li>Select the index or indices containing your data</li>
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
        <EuiSmallButton onClick={props.onClose} fill>
          Got it
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
