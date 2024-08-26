/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiCard,
  EuiHorizontalRule,
  EuiSmallButton,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { QuickConfigureModal } from './quick_configure_modal';

interface UseCaseProps {
  workflow: Workflow;
}

export function UseCase(props: UseCaseProps) {
  // name modal state
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);

  return (
    <>
      {isNameModalOpen && (
        <QuickConfigureModal
          workflow={props.workflow}
          onClose={() => setIsNameModalOpen(false)}
        />
      )}
      <EuiCard
        title={
          <EuiTitle size="s">
            <h2>{props.workflow.name}</h2>
          </EuiTitle>
        }
        titleSize="s"
        paddingSize="l"
        layout="horizontal"
      >
        <EuiFlexGroup direction="column" gutterSize="l">
          <EuiHorizontalRule size="full" margin="m" />
          <EuiFlexItem grow={true}>
            <EuiText>{props.workflow.description}</EuiText>
          </EuiFlexItem>
          <EuiFlexGroup direction="column" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                disabled={false}
                isLoading={false}
                onClick={() => {
                  setIsNameModalOpen(true);
                }}
              >
                Go
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiCard>
    </>
  );
}
