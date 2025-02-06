/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ProcessorsTitle } from '../../../../general_components';
import {
  CachedFormikState,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { ProcessorsList } from '../processors_list';
import { getEffectiveVersion } from '../../../workflows/new_workflow/new_workflow';
import { getDataSourceId } from '../../../../utils';

interface EnrichSearchRequestProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
}

/**
 * Input component for enriching a search request (configuring search request processors, etc.)
 */
export function EnrichSearchRequest(props: EnrichSearchRequestProps) {
  const [showTransformQuery, setShowTransformQuery] = useState(true);
  const dataSourceId = getDataSourceId();
  useEffect(() => {
    const checkVersion = async () => {
      if (!dataSourceId) {
        setShowTransformQuery(true);
        return;
      }

      try {
        const version = await getEffectiveVersion(dataSourceId);
        const [major, minor] = version.split('.').map(Number);
        setShowTransformQuery(major > 2 || (major === 2 && minor >= 19));
      } catch (error) {
        console.error('Error checking version:', error);
        setShowTransformQuery(true);
      }
    };

    checkVersion();
  }, [dataSourceId]);

  if (!showTransformQuery) {
    return null;
  }
  return (
    <EuiFlexGroup direction="column">
      <ProcessorsTitle
        title="Transform query"
        processorCount={
          props.uiConfig.search.enrichRequest.processors?.length || 0
        }
        optional={false}
      />
      <EuiFlexItem>
        <ProcessorsList
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.SEARCH_REQUEST}
          setCachedFormikState={props.setCachedFormikState}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
