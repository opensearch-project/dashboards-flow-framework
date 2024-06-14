/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiTitle } from '@elastic/eui';

interface ProcessorsTitleProps {
  title: string;
  processorCount: number;
}

/**
 * General component for formatting processor titles
 */
export function ProcessorsTitle(props: ProcessorsTitleProps) {
  return (
    <EuiFlexItem grow={false}>
      <EuiTitle size="s">
        <div>
          <h2
            style={{ display: 'inline-block' }}
          >{`${props.title} (${props.processorCount}) -`}</h2>
          &nbsp;
          <h2 style={{ display: 'inline-block', fontStyle: 'italic' }}>
            optional
          </h2>
        </div>
      </EuiTitle>
    </EuiFlexItem>
  );
}
