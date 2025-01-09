/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBadge, EuiFlexItem } from '@elastic/eui';
import { PROCESSOR_CONTEXT } from '../../common';

interface ProcessingBadgeProps {
  context: PROCESSOR_CONTEXT;
  oneToOne: boolean;
}

/**
 * Simple component to display a badge describing how the input data is processed
 */
export function ProcessingBadge(props: ProcessingBadgeProps) {
  return (
    <>
      {props.context !== PROCESSOR_CONTEXT.SEARCH_REQUEST && (
        <EuiFlexItem grow={false}>
          <EuiBadge>{`${
            props.context === PROCESSOR_CONTEXT.INGEST
              ? 'One to one processing'
              : props.oneToOne
              ? 'One to one processing'
              : 'Many to one processing'
          }`}</EuiBadge>
        </EuiFlexItem>
      )}
    </>
  );
}
