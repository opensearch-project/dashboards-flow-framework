/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiCodeBlock,
} from '@elastic/eui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store';
import { customStringify } from '../../../../common';

interface SimplifiedIndexDetailsModalProps {
  onClose: () => void;
  indexName: string;
}

export function SimplifiedIndexDetailsModal(
  props: SimplifiedIndexDetailsModalProps
) {
  const { indexDetails } = useSelector((state: AppState) => state.opensearch);

  // Get the index details from the redux store
  const indexDetail = indexDetails[props.indexName];

  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Index Details</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiCodeBlock
          language="json"
          fontSize="s"
          paddingSize="m"
          isCopyable
          overflowHeight={400}
        >
          {customStringify(indexDetail)}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton onClick={props.onClose} fill>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
