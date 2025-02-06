/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import semver from 'semver';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';
import { ConfigureSearchRequest } from './configure_search_request';
import { EnrichSearchRequest } from './enrich_search_request';
import { EnrichSearchResponse } from './enrich_search_response';
import {
  CachedFormikState,
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowConfig,
} from '../../../../../common';
import { catIndices, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import { getEffectiveVersion } from '../../../workflows/new_workflow/new_workflow';

interface SearchInputsProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
}

/**
 * The base component containing all of the search-related inputs
 */
export function SearchInputs(props: SearchInputsProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const [showTransformQuery, setShowTransformQuery] = useState(true);

  // re-fetch indices on initial load. When users are first creating,
  // they may enter this page without getting the updated index info
  // for a newly-created index, so we re-fetch that here.
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const version = await getEffectiveVersion(dataSourceId);
        setShowTransformQuery(semver.gte(version, '2.19.0'));
      } catch (error) {
        console.error('Error checking version:', error);
        setShowTransformQuery(true);
      }
    };

    checkVersion();
  }, [dataSourceId]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <ConfigureSearchRequest />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiHorizontalRule margin="m" />
      </EuiFlexItem>
      {showTransformQuery && (
        <>
          <EuiFlexItem grow={false}>
            <EnrichSearchRequest
              uiConfig={props.uiConfig}
              setUiConfig={props.setUiConfig}
              setCachedFormikState={props.setCachedFormikState}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiHorizontalRule margin="m" />
          </EuiFlexItem>
        </>
      )}
      <EuiFlexItem grow={false}>
        <EnrichSearchResponse
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          setCachedFormikState={props.setCachedFormikState}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
