/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiCard,
  EuiHorizontalRule,
  EuiButton,
} from '@elastic/eui';
interface UseCaseProps {
  title: string;
  description: string;
}

export function UseCase(props: UseCaseProps) {
  return (
    <EuiCard
      title={
        <EuiTitle size="s">
          <h2>{props.title}</h2>
        </EuiTitle>
      }
      titleSize="s"
      paddingSize="l"
    >
      <EuiFlexGroup direction="column" gutterSize="l">
        <EuiHorizontalRule size="full" margin="m" />
        <EuiFlexItem grow={true}>
          <EuiText>{props.description}</EuiText>
        </EuiFlexItem>
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButton
              disabled={false}
              isLoading={false}
              onClick={() => {
                // TODO: possibly link to the workflow details with a pre-configured flow
              }}
            >
              Go
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    </EuiCard>
  );
}
