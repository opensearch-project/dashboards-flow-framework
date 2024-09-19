/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCheckbox,
} from '@elastic/eui';
import {
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  Workflow,
  getCharacterLimitedString,
} from '../../../../common';
import {
  deleteWorkflow,
  deprovisionWorkflow,
  useAppDispatch,
} from '../../../store';
import { getDataSourceId, getResourcesToBeForceDeleted } from '../../../utils';
import { getCore } from '../../../services';

interface DeleteWorkflowModalProps {
  workflow: Workflow;
  clearDeleteState(): void;
}

/**
 * A modal to delete workflow. Optionally deprovision/delete associated resources.
 */
export function DeleteWorkflowModal(props: DeleteWorkflowModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  // isDeleting state used for button states
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // deprovision state
  const [deprovision, setDeprovision] = useState<boolean>(true);

  // reusable delete workflow fn
  async function handleDelete() {
    await dispatch(
      deleteWorkflow({
        workflowId: props.workflow.id as string,
        dataSourceId,
      })
    )
      .unwrap()
      .then((result) => {
        getCore().notifications.toasts.addSuccess(
          `Successfully deleted ${props.workflow.name}`
        );
      })
      .catch((err: any) => {
        getCore().notifications.toasts.addDanger(
          `Failed to delete ${props.workflow.name}`
        );
        console.error(`Failed to delete ${props.workflow.name}: ${err}`);
      });
  }

  return (
    <EuiModal onClose={() => props.clearDeleteState()}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Delete ${getCharacterLimitedString(
            props.workflow.name,
            MAX_WORKFLOW_NAME_TO_DISPLAY
          )}?`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiText>The workflow will be permanently deleted.</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id="deprovision"
              onChange={(e) => {
                setDeprovision(e.target.checked);
              }}
              checked={deprovision}
              label="Delete associated resources"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButtonEmpty
          onClick={() => props.clearDeleteState()}
          data-testid="cancelDeleteWorkflowButton"
        >
          {' '}
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton
          isDisabled={isDeleting}
          isLoading={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            if (deprovision) {
              await dispatch(
                deprovisionWorkflow({
                  apiBody: {
                    workflowId: props.workflow.id as string,
                    resourceIds: getResourcesToBeForceDeleted(props.workflow),
                  },
                  dataSourceId,
                })
              )
                .unwrap()
                .then(async (result) => {
                  handleDelete();
                })
                .catch((err: any) => {
                  getCore().notifications.toasts.addDanger(
                    `Failed to delete resources for ${props.workflow.name}`
                  );
                  console.error(
                    `Failed to delete resources for ${props.workflow.name}: ${err}`
                  );
                });
            } else {
              handleDelete();
            }
            setIsDeleting(false);
            props.clearDeleteState();
          }}
          data-testid="deleteWorkflowButton"
          fill={true}
          color="danger"
        >
          Delete
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
