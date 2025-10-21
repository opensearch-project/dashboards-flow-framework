/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiAccordion,
  EuiCallOut,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import {
  AGENT_ID_PATTERN,
  AGENTIC_SEARCH_DOCS_LINK,
  EXAMPLE_AGENTIC_SEARCH_QUERY,
  EXAMPLE_PUT_AGENTIC_SEARCH_PIPELINE,
  Workflow,
} from '../../../../common';

interface AgenticSearchApplicationContentProps {
  workflow?: Workflow;
}

const NO_AGENT_FOUND_TEXT =
  'No agent found. Make sure to select an agent before trying to use agentic search in your application.';

/**
 * Static content for next steps & how to use agentic search in your application
 */
export function AgenticSearchApplicationContent(
  props: AgenticSearchApplicationContentProps
) {
  const selectedAgentId = (props.workflow?.ui_metadata?.config?.search
    ?.requestAgentId?.value ?? '') as string;

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      {!selectedAgentId ? (
        <EuiFlexItem>
          <EuiCallOut
            size="s"
            color="warning"
            data-testid="noAgentFoundCallout"
          >
            {NO_AGENT_FOUND_TEXT}
          </EuiCallOut>
        </EuiFlexItem>
      ) : (
        <>
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              To use agentic search in your application, create a search
              pipeline and run <code>agentic</code>
              {'  '}
              search queries. Use the following examples as a starting point.
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiAccordion
              id="agenticSearchPipeline"
              paddingSize="s"
              buttonContent={
                <EuiText size="s">1. Create a search pipeline</EuiText>
              }
              initialIsOpen={true}
            >
              <EuiCodeBlock
                data-testid="searchPipelineCodeBlock"
                language="json"
                fontSize="s"
                paddingSize="s"
                overflowHeight={400}
                whiteSpace="pre"
                isCopyable={true}
              >
                {injectAgentId(
                  EXAMPLE_PUT_AGENTIC_SEARCH_PIPELINE,
                  selectedAgentId
                )}
              </EuiCodeBlock>
            </EuiAccordion>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiAccordion
              id="agenticSearchQuery"
              paddingSize="s"
              buttonContent={<EuiText size="s">2. Run a search query</EuiText>}
              initialIsOpen={true}
            >
              <EuiCodeBlock
                data-testid="agenticSearchCodeBlock"
                language="json"
                fontSize="s"
                paddingSize="s"
                overflowHeight={300}
                whiteSpace="pre"
                isCopyable={true}
              >
                {EXAMPLE_AGENTIC_SEARCH_QUERY}
              </EuiCodeBlock>
            </EuiAccordion>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              For more details and examples, check out the{' '}
              <EuiLink target="_blank" href={AGENTIC_SEARCH_DOCS_LINK}>
                full documentation
              </EuiLink>
            </EuiText>
          </EuiFlexItem>
        </>
      )}
    </EuiFlexGroup>
  );
}

function injectAgentId(template: string, agentId: string) {
  return template.replaceAll(AGENT_ID_PATTERN, agentId);
}
