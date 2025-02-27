/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiEmptyPrompt,
  EuiHealth,
  EuiSpacer,
} from '@elastic/eui';
import { WORKFLOW_STEP_TYPE, WorkflowResource } from '../../../../../common';

interface ResourceFlyoutContentProps {
  resource: WorkflowResource;
  resourceDetails: string;
  errorMessage?: string;
}

/**
 * The static flyout content for a particular workflow resource.
 */
export function ResourceFlyoutContent(props: ResourceFlyoutContentProps) {
  return (
    <EuiFlexGroup direction="column" gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>Name</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText>{props.resource?.id || ''}</EuiText>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>Status</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHealth color="success">Active</EuiHealth>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h4>
            {props.resource?.stepType ===
            WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
              ? 'Configuration'
              : 'Pipeline configuration'}
          </h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={true}>
        {!props.errorMessage ? (
          <EuiCodeBlock
            language="json"
            fontSize="m"
            isCopyable={true}
            overflowHeight={600}
          >
            {props.resourceDetails}
          </EuiCodeBlock>
        ) : (
          <EuiEmptyPrompt
            iconType="alert"
            iconColor="danger"
            title={<h2>Error loading resource details</h2>}
            body={<p>{props.errorMessage}</p>}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
