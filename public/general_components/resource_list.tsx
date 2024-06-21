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
import { Workflow, WorkflowResource } from '../../common';
import { columns } from '../pages/workflow_detail/tools/resources/columns';

interface ResourceListProps {
  workflow?: Workflow;
}

/**
 * The searchable list of resources for a particular workflow.
 */
export function ResourceList(props: ResourceListProps) {
  const [allResources, setAllResources] = useState<WorkflowResource[]>([]);

  // Hook to initialize all resources. Reduce to unique IDs, since
  // the backend resources may include the same resource multiple times
  // (e.g., register and deploy steps persist the same model ID resource)
  useEffect(() => {
    if (props.workflow?.resourcesCreated) {
      const resourcesMap = {} as { [id: string]: WorkflowResource };
      props.workflow.resourcesCreated.forEach((resource) => {
        resourcesMap[resource.id] = resource;
      });
      setAllResources(Object.values(resourcesMap));
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
