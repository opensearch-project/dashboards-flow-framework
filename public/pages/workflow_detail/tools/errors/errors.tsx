/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeBlock, EuiEmptyPrompt } from '@elastic/eui';
import { isEmpty } from 'lodash';

interface ErrorsProps {
  errorMessage: string;
}

/**
 * The basic errors component for the Tools panel.
 * Displays any errors found while users configure and test their workflow.
 */
export function Errors(props: ErrorsProps) {
  return (
    <>
      {isEmpty(props.errorMessage) ? (
        <EuiEmptyPrompt title={<h2>No errors</h2>} titleSize="s" />
      ) : (
        <EuiCodeBlock fontSize="m" isCopyable={false}>
          {props.errorMessage}
        </EuiCodeBlock>
      )}
    </>
  );
}
