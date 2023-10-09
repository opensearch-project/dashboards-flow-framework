/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiFlexGrid } from '@elastic/eui';

import { UseCase } from './use_case';

interface NewWorkflowProps {}

/**
 * TODO: may rename this later on.
 *
 * Contains the searchable library of templated workflows based
 * on a variety of use cases. Can click on them to load in a pre-configured
 * workflow for users to start with.
 */
export function NewWorkflow(props: NewWorkflowProps) {
  return (
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
  );
}
