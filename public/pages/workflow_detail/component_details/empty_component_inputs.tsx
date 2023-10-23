/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';

export function EmptyComponentInputs() {
  return (
    <EuiEmptyPrompt
      iconType={'cross'}
      title={<h2>No component selected</h2>}
      titleSize="s"
      body={
        <>
          <EuiText>
            Add a component, or select a component to view or edit its
            configuration.
          </EuiText>
        </>
      }
    />
  );
}
