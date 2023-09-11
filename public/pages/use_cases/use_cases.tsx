/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiFlexGrid,
  EuiSpacer,
} from '@elastic/eui';
import { BREADCRUMBS } from '../../utils';
import { UseCase } from './components';
import { getCore } from '../../services';

export function UseCases() {
  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  return (
    <div>
      <EuiPageHeader>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="l">
              <h1>Use Cases</h1>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageHeader>
      <EuiSpacer size="l" />
      <EuiFlexGrid columns={3} gutterSize="l">
        <EuiFlexItem>
          <UseCase
            title="Semantic Search"
            description="Semantic search description..."
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <UseCase
            title="Multi-modal Search"
            description="Multi-modal search description..."
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <UseCase
            title="Search Summarization"
            description="Search summarization description..."
          />
        </EuiFlexItem>
      </EuiFlexGrid>
    </div>
  );
}
