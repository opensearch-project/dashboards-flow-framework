/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiCard,
  EuiHorizontalRule,
  EuiButton,
} from '@elastic/eui';
import { NEW_WORKFLOW_ID_URL, PLUGIN_ID } from '../../../../common';
import { APP_PATH } from '../../../utils';

interface UseCaseProps {
  title: string;
  description: string;
  onClick: () => {};
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
      layout="horizontal"
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
              onClick={props.onClick}
              href={`${PLUGIN_ID}#${APP_PATH.WORKFLOWS}/${NEW_WORKFLOW_ID_URL}`}
            >
              Go
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    </EuiCard>
  );
}
