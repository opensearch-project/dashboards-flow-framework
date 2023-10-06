/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { Workflow } from '../../../../common';

// styling
import './workspace-styles.scss';

interface ComponentInputsProps {}

export function ComponentInputs(props: ComponentInputsProps) {
  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      justifyContent="spaceBetween"
      className="workspace-panel"
    >
      <EuiFlexItem className="resizable-panel-border">
        <EuiText>Side panel</EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
