/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { NavContent } from './nav_content';
import { CachedFormikState, WorkflowConfig } from '../../../../common';

// styling
import '../workspace/workspace-styles.scss';

interface LeftNavProps {
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

/**
 * The base left navigation component. Used as a lightweight preview of the ingest and search
 * flows, as well as a way to click and navigate to the individual components of the flows.
 */
export function LeftNav(props: LeftNavProps) {
  return (
    <EuiPanel
      paddingSize="s"
      grow={false}
      className="workspace-panel left-nav-static-width"
      borderRadius="l"
    >
      <EuiFlexGroup
        direction="column"
        justifyContent="spaceBetween"
        gutterSize="none"
        style={{
          height: '100%',
          gap: '16px',
        }}
      >
        <EuiFlexItem
          grow={true}
          style={{
            overflowY: 'scroll',
            overflowX: 'hidden',
          }}
        >
          <NavContent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            setCachedFormikState={props.setCachedFormikState}
            setSelectedComponentId={props.setSelectedComponentId}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="column" gutterSize="none">
            <EuiFlexItem>
              <EuiHorizontalRule margin="m" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup direction="row" justifyContent="spaceBetween">
                <EuiFlexItem>
                  <EuiText>Placeholder for nav buttons</EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
