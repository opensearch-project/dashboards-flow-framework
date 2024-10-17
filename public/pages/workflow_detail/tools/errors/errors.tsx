/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeBlock, EuiText } from '@elastic/eui';
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
        <EuiText size="s">There are no errors.</EuiText>
      ) : (
        <EuiCodeBlock fontSize="m" isCopyable={false}>
          {props.errorMessage}
        </EuiCodeBlock>
      )}
    </>
  );
}
