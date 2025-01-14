/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { ConfigureSearchRequest } from './configure_search_request';
import { EnrichSearchRequest } from './enrich_search_request';
import { EnrichSearchResponse } from './enrich_search_response';
import {
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowConfig,
} from '../../../../../common';
import { catIndices, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';

interface SearchInputsProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
}

/**
 * The base component containing all of the search-related inputs
 */
export function SearchInputs(props: SearchInputsProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  // re-fetch indices on initial load. When users are first creating,
  // they may enter this page without getting the updated index info
  // for a newly-created index, so we re-fetch that here.
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <ConfigureSearchRequest />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="m" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichSearchRequest
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="m" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EnrichSearchResponse
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
