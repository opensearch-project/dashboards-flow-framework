/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageContent,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { ResourceList } from './resource_list';

interface ResourcesProps {
  workflow?: Workflow;
}

/**
 * A simple resources page to browse created resources for a given Workflow.
 */
export function Resources(props: ResourcesProps) {
  return (
    <EuiPageContent>
      <EuiTitle>
        <h2>Resources</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup direction="row">
        <EuiFlexItem>
          <ResourceList workflow={props.workflow} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageContent>
  );
}
