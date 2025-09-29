/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiIcon,
  EuiTitle,
  EuiToolTip,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import { customStringify } from '../../../../../common';

interface GeneratedQueryProps {
  query: {};
}

export function GeneratedQuery(props: GeneratedQueryProps) {
  const [showQuery, setShowQuery] = useState<boolean>(true);

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          direction="row"
          gutterSize="none"
          alignItems="center"
          justifyContent="spaceBetween"
        >
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="none" alignItems="center">
              <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
                <EuiIcon type="generate" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTitle size="xs">
                  <h5>Generated query</h5>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip
                  content="The agent-generated query DSL that was run against your
                OpenSearch index"
                >
                  <EuiIcon
                    type="questionInCircle"
                    color="subdued"
                    style={{ marginLeft: '4px' }}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          {props.query && (
            <EuiFlexItem grow={false}>
              <EuiSmallButtonIcon
                aria-label="hideShowButton"
                onClick={() => setShowQuery(!showQuery)}
                iconType={showQuery ? 'eye' : 'eyeClosed'}
              ></EuiSmallButtonIcon>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
      {showQuery && (
        <EuiFlexItem grow={false}>
          <EuiCodeBlock language="json" fontSize="s" paddingSize="m" isCopyable>
            {customStringify(props.query)}
          </EuiCodeBlock>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
