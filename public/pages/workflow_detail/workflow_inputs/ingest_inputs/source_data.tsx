/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { JsonField } from '../input_fields';
import { IConfigField, WorkspaceFormValues } from '../../../../../common';

interface SourceDataProps {
  setIngestDocs: (docs: {}[]) => void;
  onFormChange: () => void;
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const { values } = useFormikContext<WorkspaceFormValues>();

  // Hook to listen when the docs form value changes.
  // Try to set the ingestDocs if possible
  useEffect(() => {
    try {
      const json = JSON.parse(values.ingest.docs);
      props.setIngestDocs([json]);
    } catch (e) {
      props.setIngestDocs([]);
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
        <JsonField
          // We want to integrate docs into the form, but not persist in the config.
          // So, we create the ConfigField explicitly inline, instead of pulling
          // from the config.
          field={
            {
              label: 'Upload JSON documents',
            } as IConfigField
          }
          fieldPath={'ingest.docs'}
          onFormChange={props.onFormChange}
          editorHeight="25vh"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
