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
import { LaunchList } from './launch_list';
import { LaunchDetails } from './launch_details';

interface LaunchesProps {
  workflow?: Workflow;
}

/**
 * The launches page to browse launch history and view individual launch details.
 */
export function Launches(props: LaunchesProps) {
  return (
    <EuiPageContent>
      <EuiTitle>
        <h2>Launches</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup direction="row">
        <EuiFlexItem>
          <LaunchList />
        </EuiFlexItem>
        <EuiFlexItem>
          <LaunchDetails />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageContent>
  );
}
