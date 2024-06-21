/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
} from '@elastic/eui';
import { Workflow } from '../../common';

interface DeleteWorkflowModalProps {
  workflow: Workflow;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A general delete workflow modal.
 */
export function DeleteWorkflowModal(props: DeleteWorkflowModalProps) {
  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Delete ${props.workflow.name}?`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText>
          The workflow will be permanently deleted. This action cannot be
          undone. Resources created by this workflow will be retained.
        </EuiText>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={props.onClose}> Cancel</EuiButtonEmpty>
        <EuiButton onClick={props.onConfirm} fill={true} color="danger">
          Delete
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
