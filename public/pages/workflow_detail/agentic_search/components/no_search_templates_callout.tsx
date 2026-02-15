/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLink } from '@elastic/eui';
import { SEARCH_TEMPLATES_DOCS_LINK } from '../../../../../common';

/**
 * Basic callout component with links to documentation.
 */
export function NoSearchTemplatesCallout({}) {
  return (
    <EuiCallOut
      size="s"
      color="warning"
      iconType={'alert'}
      title="No search templates found"
    >
      Define your own queries and dynamic parameters. For more information, see
      the{' '}
      <EuiLink target="_blank" href={SEARCH_TEMPLATES_DOCS_LINK}>
        documentation
      </EuiLink>
    </EuiCallOut>
  );
}
