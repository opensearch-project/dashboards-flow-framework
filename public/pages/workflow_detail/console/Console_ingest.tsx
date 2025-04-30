/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeBlock } from '@elastic/eui';
interface ConsoleIngestProps {
  ingestResponse: string;
  errors: Record<string, any>;
  isExpanded: boolean;
  hasContent: boolean;
}

export function ConsoleIngest(props: ConsoleIngestProps) {
  const { ingestResponse, errors, isExpanded, hasContent } = props;

  const content =
    ingestResponse ||
    (errors && Object.keys(errors).length > 0
      ? JSON.stringify(errors, null, 2)
      : '');

  console.log('ConsoleIngest rendering with:', {
    hasIngestResponse: !!ingestResponse,
    hasErrors: errors && Object.keys(errors).length > 0,
    content: content.substring(0, 100),
  });

  return (
    <EuiCodeBlock
      language="json"
      fontSize="s"
      paddingSize="m"
      overflowHeight={isExpanded ? undefined : 200}
      isCopyable={false}
      data-test-subj="consoleOutput"
      style={{
        backgroundColor: hasContent ? undefined : 'transparent',
        border: hasContent ? undefined : 'none',
        maxHeight: isExpanded ? undefined : '200px',
      }}
      className={`${
        hasContent ? '' : 'euiCodeBlock--transparentBackground'
      } hideFullScreenButton`}
    >
      {content}
    </EuiCodeBlock>
  );
}
