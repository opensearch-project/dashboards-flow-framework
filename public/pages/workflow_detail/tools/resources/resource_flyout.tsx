/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiText,
  EuiEmptyPrompt,
  EuiHealth,
  EuiSpacer,
} from '@elastic/eui';
import { WORKFLOW_STEP_TYPE, WorkflowResource } from '../../../../../common';

interface ResourceFlyoutProps {
  resource: WorkflowResource;
  resourceDetails: string;
  onClose: () => void;
  errorMessage?: string;
}

/**
 * The searchable list of resources for a particular workflow.
 */
export function ResourceFlyout(props: ResourceFlyoutProps) {
  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>Resource details</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
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
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
