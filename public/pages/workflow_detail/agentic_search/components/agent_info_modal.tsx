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
} from '@elastic/eui';

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
            convert them into optimized search queries. Ask questions in plain
            English, and the AI agent will help find the most relevant results.
          </p>
          <h4>How it works:</h4>
          <ol>
            <li>Select the index containing your data</li>
            <li>Choose or create an AI agent to interpret your queries</li>
            <li>Enter your question in natural language</li>
            <li>
              The AI agent converts your question into an optimized search query
            </li>
            <li>View search results with AI-generated explanations</li>
          </ol>
          <h4>Example questions:</h4>
          <ul>
            <li>"What's the average CPU usage across my servers last week?"</li>
            <li>"Find documents about machine learning in healthcare"</li>
            <li>
              "Show me the most recent customer complaints about shipping
              delays"
            </li>
          </ul>
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
