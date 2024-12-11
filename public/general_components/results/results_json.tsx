/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeEditor } from '@elastic/eui';
import { customStringify, SearchResponse } from '../../../common';

interface ResultsJSONProps {
  response: SearchResponse;
}

/**
 * Small component to render the raw search response.
 */
export function ResultsJSON(props: ResultsJSONProps) {
  return (
    <EuiCodeEditor
      mode="json"
      theme="textmate"
      width="100%"
      height="100%"
      value={customStringify(props.response)}
      readOnly={true}
      setOptions={{
        fontSize: '12px',
        autoScrollEditorIntoView: true,
        wrap: true,
      }}
      tabSize={2}
    />
  );
}
