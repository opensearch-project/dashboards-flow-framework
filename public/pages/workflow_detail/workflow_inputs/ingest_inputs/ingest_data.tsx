/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import { TextField } from '../input_fields';
import { AdvancedSettings } from './advanced_settings';
import { KNN_VECTOR_DOCS_LINK, WORKFLOW_TYPE } from '../../../../../common';

interface IngestDataProps {workflowType: WORKFLOW_TYPE | undefined;}

/**
 * Input component for configuring the data ingest (the OpenSearch index)
 */
export function IngestData(props: IngestDataProps) {
  const [hasInvalidDimensions, setHasInvalidDimensions] = useState<boolean>(
    false
  );

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <h3>Ingest data</h3>
        </EuiText>
      </EuiFlexItem>
      {hasInvalidDimensions && (
        <EuiCallOut
          style={{ marginLeft: '14px' }}
          size="s"
          title={
            <EuiText size="s">
              Invalid dimension detected for a vector field mapping. Ensure the
              dimension value is set correctly.{' '}
              <EuiLink target="_blank" href={KNN_VECTOR_DOCS_LINK}>
                Learn more
              </EuiLink>
            </EuiText>
          }
          color="warning"
        />
      )}
      <EuiFlexItem>
        <TextField
          label="Index name"
          fieldPath={'ingest.index.name'}
          showError={true}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <AdvancedSettings setHasInvalidDimensions={setHasInvalidDimensions} workflowType={props.workflowType} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
