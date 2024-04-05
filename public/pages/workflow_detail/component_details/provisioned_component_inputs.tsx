/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';

// Simple prompt to display when the workflow is provisioned.
export function ProvisionedComponentInputs() {
  return (
    <EuiEmptyPrompt
      iconType="bell"
      title={<h2>The workflow has been provisioned</h2>}
      titleSize="s"
      body={
        <>
          <EuiText>Please deprovision first to continue editing.</EuiText>
        </>
      }
    />
  );
}
