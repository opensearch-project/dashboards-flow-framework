/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
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
          <EuiText size="s">
            <h3>{props.workflow.name}</h3>
          </EuiText>
        }
        titleSize="s"
        paddingSize="l"
        textAlign="left"
        description={props.workflow?.description || ''}
        footer={
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                disabled={false}
                isLoading={false}
                onClick={() => {
                  setIsNameModalOpen(true);
                }}
                data-testid="goButton"
              >
                Create
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
      ></EuiCard>
    </>
  );
}
