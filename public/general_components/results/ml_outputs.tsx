/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { isEmpty } from 'lodash';
import {
  EuiCode,
  EuiCodeEditor,
  EuiEmptyPrompt,
  EuiLink,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  customStringify,
  ML_RESPONSE_PROCESSOR_EXAMPLE_DOCS_LINK,
} from '../../../common';

interface MLOutputsProps {
  mlOutputs: {};
}

/**
 * Small component to render the ML outputs within a raw search response.
 */
export function MLOutputs(props: MLOutputsProps) {
  return (
    <>
      <EuiSpacer size="s" />
      {isEmpty(props.mlOutputs) ? (
        <EuiEmptyPrompt title={<h2>No outputs found</h2>} titleSize="s" />
      ) : (
        <EuiCodeEditor
          mode="json"
          theme="textmate"
          width="100%"
          height="100%"
          value={customStringify(props.mlOutputs)}
          readOnly={true}
          setOptions={{
            fontSize: '12px',
            autoScrollEditorIntoView: true,
            wrap: true,
          }}
          tabSize={2}
        />
      )}
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        Showing ML outputs stored in <EuiCode>ext.ml_inference</EuiCode> from
        the search response.{' '}
        <EuiLink href={ML_RESPONSE_PROCESSOR_EXAMPLE_DOCS_LINK} target="_blank">
          See an example
        </EuiLink>
      </EuiText>
    </>
  );
}
