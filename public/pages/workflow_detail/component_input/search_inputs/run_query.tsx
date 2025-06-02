/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiCallOut,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiSmallButton,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import {
  Workflow,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  formikToUiConfig,
  getTransformedQuery,
  hasProvisionedIngestResources,
  hasProvisionedSearchResources,
} from '../../../../utils';

interface RunQueryProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig;
  displaySearchPanel: () => void;
  includeSearchResultTransforms?: boolean;
}

/**
 * Fetch the final transformed query, up to / including any configured search request processors.
 * Quick-navigate to the test panel, to search without any search results transformations.
 */
export function RunQuery(props: RunQueryProps) {
  const { values } = useFormikContext<WorkflowFormValues>();
  const includeSearchResultTransforms =
    props.includeSearchResultTransforms ?? false;
  const ingestEnabled = values?.ingest?.enabled as boolean;
  const ingestNotCreated =
    ingestEnabled && !hasProvisionedIngestResources(props.workflow);
  const searchNotConfigured =
    !ingestEnabled && isEmpty(values?.search?.index?.name);
  const noConfiguredIndex = ingestNotCreated || searchNotConfigured;
  const searchResultTransformsConfigured =
    hasProvisionedSearchResources(props.workflow) &&
    props.uiConfig?.search?.enrichResponse?.processors?.length > 0;

  const [transformedQuery, setTransformedQuery] = useState<string | undefined>(
    undefined
  );
  const [hasQueryTransformations, setHasQueryTransformations] = useState<
    boolean
  >(false);
  useEffect(() => {
    if (props.uiConfig !== undefined && values?.search?.request !== undefined) {
      const updatedConfig = formikToUiConfig(values, props.uiConfig);
      const query = getTransformedQuery(updatedConfig);
      if (query !== undefined) {
        setTransformedQuery(query);
        setHasQueryTransformations(true);
      } else {
        setTransformedQuery(values?.search?.request);
        setHasQueryTransformations(false);
      }
    }
  }, [props.uiConfig, values?.search]);

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h4>
            {hasQueryTransformations
              ? 'Final transformed query'
              : 'Final query'}
          </h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText color="subdued" size="s">
          {`The final ${
            hasQueryTransformations ? 'transformed' : ''
          } query to be run against the index.`}
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
      {includeSearchResultTransforms && (
        <EuiFlexItem>
          <EuiHealth
            color={searchResultTransformsConfigured ? 'success' : 'subdued'}
          >
            <EuiText>
              {searchResultTransformsConfigured
                ? 'Search results transformations configured'
                : 'No search results transformations configured'}
            </EuiText>
          </EuiHealth>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiText color="subdued" size="s">
          Click button below and use the inspect panel to test out the query.
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="column">
          {noConfiguredIndex && (
            <EuiFlexItem grow={false} style={{ marginBottom: '0px' }}>
              <EuiCallOut
                size="s"
                color="warning"
                title="Missing search configurations"
              >
                <p>Create an index and ingest data first.</p>
              </EuiCallOut>
            </EuiFlexItem>
          )}
          <EuiFlexItem>
            <EuiFlexGroup direction="row" alignItems="flexStart">
              <EuiFlexItem grow={false}>
                <EuiSmallButton
                  fill={false}
                  disabled={noConfiguredIndex}
                  iconSide="left"
                  iconType="menuRight"
                  onClick={() => {
                    props.displaySearchPanel();
                  }}
                >
                  Test in Inspect panel
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
