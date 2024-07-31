/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiCard,
  EuiHorizontalRule,
  EuiButton,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFormRow,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { createWorkflow, useAppDispatch } from '../../../store';
import { useLocation } from 'react-router-dom';
import { getDataSourceFromURL } from '../../../utils/helpers';

interface UseCaseProps {
  workflow: Workflow;
}

export function UseCase(props: UseCaseProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const MDSQueryParams = getDataSourceFromURL(location);
  const dataSourceId = MDSQueryParams.dataSourceId;
  const history = useHistory();

  // name modal state
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);

  // workflow name state
  const [workflowName, setWorkflowName] = useState<string>(
    processWorkflowName(props.workflow.name)
  );

  return (
    <>
      {isNameModalOpen && (
        <EuiModal onClose={() => setIsNameModalOpen(false)}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <p>{`Set a unique name for your workflow`}</p>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiFormRow
              label={'Name'}
              error={'Name cannot be empty'}
              isInvalid={workflowName === ''}
            >
              <EuiFieldText
                placeholder={processWorkflowName(props.workflow.name)}
                compressed={false}
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value);
                }}
              />
            </EuiFormRow>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => setIsNameModalOpen(false)}>
              Cancel
            </EuiButtonEmpty>
            <EuiButton
              disabled={workflowName === ''}
              onClick={() => {
                const workflowToCreate = {
                  ...props.workflow,
                  name: workflowName,
                };
                dispatch(createWorkflow({workflowBody:workflowToCreate, dataSourceId:dataSourceId}))
                  .unwrap()
                  .then((result) => {
                    const { workflow } = result;
                    history.replace((dataSourceId ? `${APP_PATH.WORKFLOWS}/${workflow.id}?dataSourceId=${dataSourceId}` : `${APP_PATH.WORKFLOWS}/${workflow.id}`));
                    history.go(0);
                  })
                  .catch((err: any) => {
                    console.error(err);
                  });
              }}
              fill={true}
              color="primary"
            >
              Create
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
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
                  setIsNameModalOpen(true);
                }}
              >
                Go
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiCard>
    </>
  );
}
