/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiButton,
  EuiSmallButton,
  EuiCompressedFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import { WorkspaceFormValues } from '../../../../../common';

interface SourceDataProps {
  setIngestDocs: (docs: string) => void;
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const { values, setFieldValue } = useFormikContext<WorkspaceFormValues>();

  // edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // files state. when a file is read, update the form value.
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target) {
      setFieldValue('ingest.docs', e.target.result);
    }
  };

  // Hook to listen when the docs form value changes.
  // Try to set the ingestDocs if possible
  useEffect(() => {
    if (values?.ingest?.docs) {
      props.setIngestDocs(values.ingest.docs);
    }
  }, [values?.ingest?.docs]);

  return (
    <>
      {isEditModalOpen && (
        <EuiModal
          onClose={() => setIsEditModalOpen(false)}
          style={{ width: '70vw' }}
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <p>{`Edit source data`}</p>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <>
              <EuiText color="subdued">
                Upload a JSON file or enter manually.
              </EuiText>{' '}
              <EuiSpacer size="s" />
              <EuiCompressedFilePicker
                accept="application/json"
                multiple={false}
                initialPromptText="Upload file"
                onChange={(files) => {
                  if (files && files.length > 0) {
                    fileReader.readAsText(files[0]);
                  }
                }}
                display="default"
              />
              <EuiSpacer size="s" />
              <JsonField
                label="Documents"
                fieldPath={'ingest.docs'}
                helpText="Documents should be formatted as a valid JSON array."
                editorHeight="25vh"
                readOnly={false}
              />
            </>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiSmallButton
              onClick={() => setIsEditModalOpen(false)}
              fill={false}
              color="primary"
            >
              Close
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      )}
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h2>Source data</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill={false}
            style={{ width: '100px' }}
            size="s"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <JsonField
            label="Documents"
            fieldPath={'ingest.docs'}
            helpText="Documents should be formatted as a valid JSON array."
            editorHeight="25vh"
            readOnly={true}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
