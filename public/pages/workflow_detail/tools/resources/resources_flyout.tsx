/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTab,
  EuiTabs,
  EuiTitle,
} from '@elastic/eui';
import {
  WORKFLOW_RESOURCE_TYPE,
  WorkflowResource,
} from '../../../../../common';
import { ResourceFlyoutContent } from './resource_flyout_content';
import { get } from 'lodash';

interface ResourcesFlyoutProps {
  resources: WorkflowResource[];
  resourceDetails: string[];
  onClose: () => void;
  errorMessage?: string;
}

/**
 * A simple flyout to display details for multiple workflow resources nested
 * under tabs.
 */
export function ResourcesFlyout(props: ResourcesFlyoutProps) {
  const [selectedResourceIdx, setSelectedResourceIdx] = useState<number>(0);
  const [selectedTabId, setSelectedTabId] = useState<string>(
    get(props, `resources.${selectedResourceIdx}.id`)
  );
  const selectedResource = get(
    props,
    `resources.${selectedResourceIdx}`,
    undefined
  ) as WorkflowResource | undefined;
  const selectedResourceDetails = get(
    props,
    `resourceDetails.${selectedResourceIdx}`,
    undefined
  ) as string | undefined;

  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>Resource details</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexItem grow={false}>
          <EuiTabs size="s" expand={false}>
            {props.resources?.map((tab, idx) => {
              return (
                <EuiTab
                  onClick={() => {
                    setSelectedTabId(tab.id);
                    setSelectedResourceIdx(idx);
                  }}
                  isSelected={tab.id === selectedTabId}
                  disabled={false}
                  key={idx}
                >
                  {tab?.type === WORKFLOW_RESOURCE_TYPE.INDEX_NAME
                    ? 'Index'
                    : 'Pipeline'}
                </EuiTab>
              );
            })}
          </EuiTabs>
        </EuiFlexItem>
        {selectedResource !== undefined &&
          selectedResourceDetails !== undefined && (
            <ResourceFlyoutContent
              resource={selectedResource}
              resourceDetails={selectedResourceDetails}
              errorMessage={props.errorMessage}
            />
          )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
