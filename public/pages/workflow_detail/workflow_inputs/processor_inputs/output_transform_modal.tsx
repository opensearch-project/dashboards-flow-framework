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

interface OutputTransformModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function OutputTransformModal(props: OutputTransformModalProps) {
  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure output transform`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText>TODO TODO TODO</EuiText>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={props.onClose}> Cancel</EuiButtonEmpty>
        <EuiButton onClick={props.onConfirm} fill={true} color="primary">
          Save
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
