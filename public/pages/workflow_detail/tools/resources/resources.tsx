/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import { Workflow } from '../../../../../common';
import { ResourceList } from './resource_list';

interface ResourcesProps {
  workflow?: Workflow;
}

/**
 * A simple resources page to browse created resources for a given Workflow.
 */
export function Resources(props: ResourcesProps) {
  return (
    <>
      {props.workflow?.resourcesCreated &&
      props.workflow.resourcesCreated.length > 0 ? (
        <>
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <ResourceList workflow={props.workflow} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      ) : (
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>No resources available</h2>}
          titleSize="s"
          body={
            <>
              <EuiText>
                Provision the workflow to generate resources in order to start
                prototyping.
              </EuiText>
            </>
          }
        />
      )}
    </>
  );
}
