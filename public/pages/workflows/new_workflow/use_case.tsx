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
import { WORKFLOW_NAME_REGEXP, Workflow } from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { createWorkflow, useAppDispatch } from '../../../store';
import { constructUrlWithParams, getDataSourceId } from '../../../utils/utils';

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

  // custom sanitization on workflow name
  function isInvalid(name: string): boolean {
    return (
      name === '' ||
      name.length > 100 ||
      WORKFLOW_NAME_REGEXP.test(name) === false
    );
  }

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
              error={'Invalid name'}
              isInvalid={isInvalid(workflowName)}
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
              disabled={isInvalid(workflowName)}
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
                      constructUrlWithParams(
                        APP_PATH.WORKFLOWS,

                        workflow.id,
                        dataSourceId
                      )
                    );
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
