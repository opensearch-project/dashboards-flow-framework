/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import {
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';

interface ErrorsProps {
  errorMessages: (string | ReactNode)[];
}

/**
 * The basic errors component for the Tools panel.
 * Displays any errors found while users configure and test their workflow.
 */
export function Errors(props: ErrorsProps) {
  return (
    <>
      {props.errorMessages?.length === 0 ? (
        <EuiEmptyPrompt title={<h2>No errors</h2>} titleSize="s" />
      ) : (
        <>
          {props.errorMessages.map((errorMessage, idx) => {
            return (
              <EuiFlexItem grow={false} key={idx}>
                <EuiSpacer size="m" />
                <EuiCodeBlock
                  fontSize="m"
                  isCopyable={false}
                  paddingSize="s"
                  style={{
                    flexGrow: 'false',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  whiteSpace="pre-wrap"
                >
                  {errorMessage}
                </EuiCodeBlock>
              </EuiFlexItem>
            );
          })}
        </>
      )}
    </>
  );
}
