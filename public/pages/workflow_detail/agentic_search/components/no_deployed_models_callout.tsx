/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLink } from '@elastic/eui';
import { AGENTIC_SEARCH_DOCS_LINK } from '../../../../../common';

/**
 * Basic callout component with links to documentation.
 */
export function NoDeployedModelsCallout({}) {
  return (
    <EuiCallOut
      size="s"
      color="warning"
      iconType={'alert'}
      title="No deployed models found"
    >
      Deploy models compatible with agentic search. For more information, see
      the{' '}
      <EuiLink target="_blank" href={AGENTIC_SEARCH_DOCS_LINK}>
        documentation
      </EuiLink>
    </EuiCallOut>
  );
}
