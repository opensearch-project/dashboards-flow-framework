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

interface AdvancedTransformModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A modal to perform advanced JSON-to-JSON transforms to/from a model's input/output, respectively
 */
export function AdvancedTransformModal(props: AdvancedTransformModalProps) {
  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure advanced transform`}</p>
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
