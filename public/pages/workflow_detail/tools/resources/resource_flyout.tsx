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
  EuiLoadingSpinner,
} from '@elastic/eui';

interface ResourceFlyoutProps {
  resourceName: string;
  resourceDetails: string;
  onClose: () => void;
  loading: boolean;
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
          <EuiFlexItem grow={true}>
            <EuiText size="m">
              <h4>Resource details</h4>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            {!props.errorMessage && !props.loading ? (
              <EuiCodeBlock
                language="json"
                fontSize="m"
                isCopyable={true}
                overflowHeight={600}
              >
                {props.resourceDetails}
              </EuiCodeBlock>
            ) : props.loading ? (
              <EuiEmptyPrompt
                icon={<EuiLoadingSpinner size="xl" />}
                title={<h2>Loading</h2>}
              />
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
