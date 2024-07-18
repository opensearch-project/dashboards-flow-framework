/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import { WorkspaceFormValues } from '../../../../../common';

interface SourceDataProps {
  setIngestDocs: (docs: string) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const { values, setFieldValue } = useFormikContext<WorkspaceFormValues>();

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
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Source data</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFilePicker
          accept="application/json"
          multiple={false}
          initialPromptText="Select a JSON file containing documents"
          onChange={(files) => {
            if (files && files.length > 0) {
              fileReader.readAsText(files[0]);
            }
          }}
          display="default"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <JsonField
          label="Upload JSON documents"
          fieldPath={'ingest.docs'}
          helpText="Documents should be formatted as a valid JSON array."
          // when ingest doc values change, don't update the form
          // since we initially only support running ingest once per configuration
          onFormChange={() => {}}
          editorHeight="25vh"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
