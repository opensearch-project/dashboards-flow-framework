/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeEditor } from '@elastic/eui';

interface QueryProps {
  queryResponse: string;
}

/**
 * The basic query component for the Tools panel.
 * Displays a read-only view of the query response after users perform search.
 */
export function Query(props: QueryProps) {
  return (
    // TODO: known issue with the editor where resizing the resizablecontainer does not
    // trigger vertical scroll updates. Updating the window, or reloading the component
    // by switching tabs etc. will refresh it correctly
    <EuiCodeEditor
      mode="json"
      theme="textmate"
      width="100%"
      height="100%"
      value={props.queryResponse}
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
