import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonIcon,
  EuiCodeBlock,
  EuiEmptyPrompt,
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

  // Determine what content to show
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
              }}
              className="hideFullScreenButton"
            >
              {content}
            </EuiCodeBlock>
          </>
        ) : (
          <EuiEmptyPrompt
            iconType="console"
            title={<h4>No output to display</h4>}
            titleSize="xs"
            body={
              context === CONFIG_STEP.INGEST ? (
                <EuiText size="s">Run ingest to view output here.</EuiText>
              ) : (
                <EuiText size="s">No search errors to display.</EuiText>
              )
            }
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
