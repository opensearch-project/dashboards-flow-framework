/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { PROCESSOR_CONTEXT } from '../../../../../common';

interface InputTransformModalProps {
  context: PROCESSOR_CONTEXT;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms into a model's expected input
 */
export function InputTransformModal(props: InputTransformModalProps) {
  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure input transform`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiButton
                style={{ width: '250px' }}
                onClick={() => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      // TODO: complete for ingest. generate and simulate an ingest pipeline up to this point
                      break;
                    }
                    // TODO: complete for search request / search response contexts
                  }
                }}
              >
                Fetch expected input
              </EuiButton>
              <EuiSpacer size="s" />
              <EuiCodeBlock fontSize="m" isCopyable={false}>
                {`{"a": "b"}`}
              </EuiCodeBlock>
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Define transform with JSONPath</EuiText>
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                value={`{"a": "b"}`}
                readOnly={false}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                }}
                tabSize={2}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Expected output</EuiText>
              <EuiSpacer size="s" />
              <EuiCodeBlock fontSize="m" isCopyable={false}>
                {`TODO: will be model input`}
              </EuiCodeBlock>
            </>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={props.onClose}>Cancel</EuiButtonEmpty>
        <EuiButton onClick={props.onConfirm} fill={true} color="primary">
          Save
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
