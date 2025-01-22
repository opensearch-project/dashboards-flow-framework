/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';

interface IntroFlyoutProps {
  onClose: () => void;
}

/**
 * Basic introduction flyout describing how the plugin works. Contains just static content.
 */
export function IntroFlyout(props: IntroFlyoutProps) {
  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>{`How it works`}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>TODO add panels</EuiFlexItem>
          <EuiFlexItem grow={false}>TODO add panel content</EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
