/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut } from '@elastic/eui';

/**
 * Basic callout component for missing/empty indices.
 */
export function NoIndicesCallout({}) {
  return (
    <EuiCallOut
      size="s"
      color="warning"
      iconType={'alert'}
      title="No indices found"
    >
      No indices are available. Please create an index and ingest documents to
      search against first.
    </EuiCallOut>
  );
}
