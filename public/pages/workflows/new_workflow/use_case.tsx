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
  EuiSmallButton,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiCompressedFieldText,
  EuiCompressedFormRow,
} from '@elastic/eui';
import { Workflow } from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { createWorkflow, useAppDispatch } from '../../../store';
import { getDataSourceId } from '../../../utils/utils';

interface UseCaseProps {
  workflow: Workflow;
}

export function UseCase(props: UseCaseProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
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
            <EuiCompressedFormRow
              label={'Name'}
              error={'Name cannot be empty'}
              isInvalid={workflowName === ''}
            >
              <EuiCompressedFieldText
                placeholder={processWorkflowName(props.workflow.name)}
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value);
                }}
              />
            </EuiCompressedFormRow>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiSmallButtonEmpty onClick={() => setIsNameModalOpen(false)}>
              Cancel
            </EuiSmallButtonEmpty>
            <EuiSmallButton
              disabled={workflowName === ''}
              onClick={() => {
                const workflowToCreate = {
                  ...props.workflow,
                  name: workflowName,
                };
                dispatch(
                  createWorkflow({
                    apiBody: workflowToCreate,
                    dataSourceId,
                  })
                )
                  .unwrap()
                  .then((result) => {
                    const { workflow } = result;
                    history.replace(
                      `${APP_PATH.WORKFLOWS}/${workflow.id}${
                        dataSourceId !== undefined
                          ? `?dataSourceId=${dataSourceId}`
                          : ''
                      }`
                    );
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
            </EuiSmallButton>
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
              <EuiSmallButton
                disabled={false}
                isLoading={false}
                onClick={() => {
                  setIsNameModalOpen(true);
                }}
              >
                Go
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiCard>
    </>
  );
}
