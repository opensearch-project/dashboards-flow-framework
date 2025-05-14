/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiCodeBlock,
  EuiPopoverTitle,
} from '@elastic/eui';
import { BULK_API_DOCS_LINK } from '../../../../../common';

interface BulkPopoverContentProps {
  indexName: string;
}

/**
 * A basic component containing details about the bulk API and link to documentation.
 * Provides a partially-complete example, dynamically populated based on an index name.
 */
export function BulkPopoverContent(props: BulkPopoverContentProps) {
  return (
    <EuiFlexItem style={{ width: '40vw' }}>
      <EuiPopoverTitle>Ingest additional data</EuiPopoverTitle>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiText>
            You can ingest additional bulk data into the same index using the
            Bulk API.{' '}
            <EuiLink href={BULK_API_DOCS_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiCodeBlock fontSize="m" isCopyable={true}>
            {`POST ${props.indexName}/_bulk
{ "index": { "_index": "${props.indexName}", "_id": //YOUR DOC ID// } }
{ //INSERT YOUR DOCUMENTS// }`}
          </EuiCodeBlock>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
