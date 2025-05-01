/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';
import { USE_NEW_HOME_PAGE } from '../../../utils';
import { NavContent } from './nav_content';
import { CachedFormikState, WorkflowConfig } from '../../../../common';
/**
 * Base component for rendering processor form inputs based on the processor type
 */

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
      grow={true}
      borderRadius="l"
      style={{
        marginTop: USE_NEW_HOME_PAGE ? '0' : '58px',
        height: USE_NEW_HOME_PAGE ? '100%' : 'calc(100% - 58px)',
        width: '500px',
        gap: '4px',
      }}
    >
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <NavContent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            setCachedFormikState={props.setCachedFormikState}
            setSelectedComponentId={props.setSelectedComponentId}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
