/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageContent,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { QueryExecutor } from './query_executor';

interface PrototypeProps {
  workflow?: Workflow;
}

/**
 * A simple prototyping page to perform ingest and search.
 */
export function Prototype(props: PrototypeProps) {
  return (
    <EuiPageContent>
      <EuiTitle>
        <h2>Prototype</h2>
      </EuiTitle>
      <EuiSpacer size="m" />
      {props.workflow?.resourcesCreated &&
      props.workflow?.resourcesCreated.length > 0 ? (
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <QueryExecutor workflow={props.workflow} />
          </EuiFlexItem>
        </EuiFlexGroup>
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
    </EuiPageContent>
  );
}
