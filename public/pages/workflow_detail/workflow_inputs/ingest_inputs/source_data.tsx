/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui';

interface SourceDataProps {
  ingestDocs: {}[];
  setIngestDocs: (docs: {}[]) => void;
}

/**
 * Input component for configuring the source data for ingest.
 */
export function SourceData(props: SourceDataProps) {
  const [jsonStr, setJsonStr] = useState<string>('{}');

  useEffect(() => {
    try {
      const json = JSON.parse(jsonStr);
      props.setIngestDocs([json]);
    } catch (e) {
      props.setIngestDocs([]);
    }
  }, [jsonStr]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>Source data</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiCodeEditor
          mode="json"
          theme="textmate"
          width="100%"
          height="25vh"
          value={jsonStr}
          onChange={(input) => {
            setJsonStr(input);
          }}
          readOnly={false}
          setOptions={{
            fontSize: '14px',
          }}
          aria-label="Code Editor"
          tabSize={2}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
