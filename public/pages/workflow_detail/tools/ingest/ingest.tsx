/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeEditor } from '@elastic/eui';

interface IngestProps {
  ingestResponse: string;
}

/**
 * The basic ingest component for the Tools panel.
 * Displays a read-only view of the ingest response after users perform ingest.
 */
export function Ingest(props: IngestProps) {
  return (
    // TODO: known issue with the editor where resizing the resizablecontainer does not
    // trigger vertical scroll updates. Updating the window, or reloading the component
    // by switching tabs etc. will refresh it correctly
    <EuiCodeEditor
      mode="json"
      theme="textmate"
      width="100%"
      height="100%"
      value={props.ingestResponse}
      readOnly={true}
      setOptions={{
        fontSize: '12px',
        autoScrollEditorIntoView: true,
      }}
      tabSize={2}
    />
  );
}
