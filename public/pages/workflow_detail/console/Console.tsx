/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonIcon,
  EuiCodeBlock,
} from '@elastic/eui';
import { CONFIG_STEP } from '../../../../common';

interface ConsoleProps {
  context: CONFIG_STEP;
  ingestResponse: string;
  ingestPipelineErrors: Record<string, any>;
  searchPipelineErrors: Record<string, any>;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export function Console(props: ConsoleProps) {
  const {
    context,
    ingestResponse,
    ingestPipelineErrors,
    searchPipelineErrors,
    isExpanded,
    setIsExpanded,
  } = props;

  let content = '';
  if (context === CONFIG_STEP.INGEST) {
    if (ingestResponse) {
      content = ingestResponse;
    } else if (
      ingestPipelineErrors &&
      Object.keys(ingestPipelineErrors).length > 0
    ) {
      content = JSON.stringify(ingestPipelineErrors, null, 2);
    }
  } else if (
    searchPipelineErrors &&
    Object.keys(searchPipelineErrors).length > 0
  ) {
    content = JSON.stringify(searchPipelineErrors, null, 2);
  }

  const hasContent = content !== '';

  console.log('Console props:', {
    context: props.context,
    hasIngestResponse: !!props.ingestResponse,
    hasIngestErrors:
      ingestPipelineErrors && Object.keys(ingestPipelineErrors).length > 0,
    hasSearchErrors:
      searchPipelineErrors && Object.keys(searchPipelineErrors).length > 0,
  });

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiText size="s">
              <h3>Console</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType={isExpanded ? 'fold' : 'unfold'}
              aria-label={isExpanded ? 'Collapse console' : 'Expand console'}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        {hasContent ? (
          <>
            <style>{`
              .hideFullScreenButton .euiCodeBlock__fullScreenButton {
                display: none !important;
              }
            `}</style>
            <EuiCodeBlock
              language="json"
              fontSize="s"
              paddingSize="m"
              overflowHeight={isExpanded ? undefined : 200}
              isCopyable={false}
              data-test-subj="consoleOutput"
              style={{
                maxHeight: isExpanded ? undefined : '200px',
                overflowX: 'hidden',
                overflowY:
                  hasContent && content.length > 500 ? 'auto' : 'hidden',
                width: '100%',
                wordWrap: 'break-word',
              }}
              className="hideFullScreenButton"
            >
              {content}
            </EuiCodeBlock>
          </>
        ) : (
          <div
            style={{
              height: '200px',
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
