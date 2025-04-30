// console_errors.tsx
import React from 'react';
import { EuiCodeBlock } from '@elastic/eui';

interface ConsoleErrorsProps {
  errors: Record<string, any>;
  isExpanded: boolean;
  hasContent: boolean;
}

export function ConsoleErrors(props: ConsoleErrorsProps) {
  const { errors, isExpanded, hasContent } = props;

  const content = JSON.stringify(errors, null, 2) || '';

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
