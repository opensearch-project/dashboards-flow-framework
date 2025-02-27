/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';
import { WorkflowResource } from '../../../../../common';
import { ResourceFlyoutContent } from './resource_flyout_content';

interface ResourceFlyoutProps {
  resource: WorkflowResource;
  resourceDetails: string;
  onClose: () => void;
  errorMessage?: string;
}

/**
 * A simple flyout to display details for a particular workflow resource.
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
        <ResourceFlyoutContent
          resource={props.resource}
          resourceDetails={props.resourceDetails}
          errorMessage={props.errorMessage}
        />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
