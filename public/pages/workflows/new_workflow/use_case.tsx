/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiCard,
  EuiHorizontalRule,
  EuiButton,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { createWorkflow, useAppDispatch } from '../../../store';

interface UseCaseProps {
  // onClick: () => {};
  workflow: Workflow;
}

export function UseCase(props: UseCaseProps) {
  const dispatch = useAppDispatch();
  const history = useHistory();

  return (
    <EuiCard
      title={
        <EuiTitle size="s">
          <h2>{props.workflow.name}</h2>
        </EuiTitle>
      }
      titleSize="s"
      paddingSize="l"
      layout="horizontal"
    >
      <EuiFlexGroup direction="column" gutterSize="l">
        <EuiHorizontalRule size="full" margin="m" />
        <EuiFlexItem grow={true}>
          <EuiText>{props.workflow.description}</EuiText>
        </EuiFlexItem>
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButton
              disabled={false}
              isLoading={false}
              onClick={() => {
                const workflowToCreate = {
                  ...props.workflow,
                  // TODO: handle duplicate name gracefully. it won't slash or produce errors, but nice-to-have
                  // as long as not too expensive to fetch duplicate names
                  name: processWorkflowName(props.workflow.name),
                };

                dispatch(createWorkflow(workflowToCreate))
                  .unwrap()
                  .then((result) => {
                    const { workflow } = result;
                    history.replace(`${APP_PATH.WORKFLOWS}/${workflow.id}`);
                    history.go(0);
                  })
                  .catch((err: any) => {
                    console.error(err);
                  });
              }}
            >
              Create
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    </EuiCard>
  );
}
