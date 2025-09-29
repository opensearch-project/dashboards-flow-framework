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
  EuiCodeBlock,
  EuiSmallButton,
} from '@elastic/eui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { customStringify } from '../../../../../common';

interface IndexDetailsModalProps {
  onClose: () => void;
  indexName: string;
}

export function IndexDetailsModal(props: IndexDetailsModalProps) {
  const { indexDetails } = useSelector((state: AppState) => state.opensearch);

  // Get the index details from the redux store
  const indexDetail = indexDetails[props.indexName];

  return (
    <EuiModal style={{ width: '70vw' }} onClose={props.onClose}>
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
        <EuiSmallButton onClick={props.onClose} fill>
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
