/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';

interface EmptyListMessageProps {
  onClickNewWorkflow: () => void;
}

export function EmptyListMessage(props: EmptyListMessageProps) {
  return (
    <EuiFlexGroup direction="column" alignItems="center" gutterSize="m">
      <EuiFlexItem>
        <EuiSpacer size="m" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiTitle size="s">
          <h3>No workflows found</h3>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText size="s">
          Create a workflow to start building and testing your application.
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSmallButton fill={false} onClick={props.onClickNewWorkflow}>
          New workflow
        </EuiSmallButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
