/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { WorkflowConfig, WorkflowFormValues } from '../../../../../common';
import { formikToUiConfig, getTransformedQuery } from '../../../../utils';

interface RunQueryProps {
  uiConfig: WorkflowConfig;
  displaySearchPanel: () => void;
}

/**
 * Fetch the final transformed query, up to / including any configured search request processors.
 * Quick-navigate to the test panel, to search without any search results transformations.
 */
export function RunQuery(props: RunQueryProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  const [transformedQuery, setTransformedQuery] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (props.uiConfig !== undefined && values?.search?.request !== undefined) {
      const updatedConfig = formikToUiConfig(values, props.uiConfig);
      const query = getTransformedQuery(updatedConfig);
      if (query !== undefined) {
        setTransformedQuery(query);
      } else {
        setTransformedQuery(values?.search?.request);
      }
    }
  }, [props.uiConfig, values?.search]);

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>Query</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText color="subdued" size="s">
          The final transformed query to be run against the index. If there are
          no query transformations, it will be identical to your configured
          sample query.
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiCodeBlock
          fontSize="s"
          language="json"
          overflowHeight={500}
          isCopyable={false}
          whiteSpace="pre"
          paddingSize="none"
        >
          {transformedQuery}
        </EuiCodeBlock>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText color="subdued" size="s">
          Click button below and use the inspect panel to test out the query.
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="row" alignItems="flexStart">
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill={false}
              iconSide="left"
              iconType="play"
              onClick={() => {
                props.displaySearchPanel();
              }}
            >
              Run test
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
