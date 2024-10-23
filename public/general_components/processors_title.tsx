/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiText } from '@elastic/eui';

interface ProcessorsTitleProps {
  title: string;
  processorCount: number;
}

/**
 * General component for formatting processor titles
 */
export function ProcessorsTitle(props: ProcessorsTitleProps) {
  return (
    <EuiFlexItem
      grow={false}
      style={{ marginTop: '-24px', marginBottom: '-8px' }}
    >
      <EuiText size="s">
        <>
          <h3
            style={{ display: 'inline-block' }}
          >{`${props.title} (${props.processorCount}) -`}</h3>
          &nbsp;
          <h3 style={{ display: 'inline-block', fontStyle: 'italic' }}>
            optional
          </h3>
        </>
      </EuiText>
    </EuiFlexItem>
  );
}
