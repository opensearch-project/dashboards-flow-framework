/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiInMemoryTable,
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { Workflow, WorkflowResource } from '../../../../common';
import { columns } from './columns';

interface ResourceListProps {
  workflow?: Workflow;
}

/**
 * The searchable list of resources for a particular workflow.
 */
export function ResourceList(props: ResourceListProps) {
  const [allResources, setAllResources] = useState<WorkflowResource[]>(
    props.workflow?.resourcesCreated || []
  );

  // Hook to initialize all resources
  useEffect(() => {
    if (props.workflow?.resourcesCreated) {
      setAllResources(props.workflow.resourcesCreated);
    }
  }, [props.workflow?.resourcesCreated]);

  const sorting = {
    sort: {
      field: 'id',
      direction: 'asc' as Direction,
    },
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiInMemoryTable<WorkflowResource>
          items={allResources}
          rowHeader="id"
          columns={columns}
          sorting={sorting}
          pagination={true}
          message={'No existing resources found'}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
