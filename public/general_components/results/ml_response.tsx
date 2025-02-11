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

interface MLResponseProps {
  mlResponse: {};
}

/**
 * Small component to render the ML response within a raw search response.
 */
export function MLResponse(props: MLResponseProps) {
  return (
    <>
      <EuiSpacer size="s" />
      <EuiText size="s">
        Showing results stored in <EuiCode>ext.ml_inference</EuiCode> from the
        search response.{' '}
        <EuiLink href={ML_RESPONSE_PROCESSOR_EXAMPLE_DOCS_LINK} target="_blank">
          See an example
        </EuiLink>
      </EuiText>
      <EuiSpacer size="m" />
      {isEmpty(props.mlResponse) ? (
        <EuiEmptyPrompt title={<h2>No response found</h2>} titleSize="s" />
      ) : (
        <EuiCodeEditor
          mode="json"
          theme="textmate"
          width="100%"
          height="100%"
          value={customStringify(props.mlResponse)}
          readOnly={true}
          setOptions={{
            fontSize: '12px',
            autoScrollEditorIntoView: true,
            wrap: true,
          }}
          tabSize={2}
        />
      )}
    </>
  );
}
