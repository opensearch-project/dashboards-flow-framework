/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCard, EuiIcon, EuiText } from '@elastic/eui';
import { NavComponent } from './nav_component';
import {
  CachedFormikState,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../../common';
import { ProcessorComponents } from './processor_components';

interface TransformDataProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  context: PROCESSOR_CONTEXT;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  setSelectedComponentId: (id: string) => void;
}

/**
 * The parent component containing the list of ingest processor sub-components.
 */
export function TransformData(props: TransformDataProps) {
  return (
    <NavComponent
      title="Transform data"
      icon="compute"
      body={
        <ProcessorComponents
          uiConfig={props.uiConfig}
          setUiConfig={props.setUiConfig}
          context={PROCESSOR_CONTEXT.INGEST}
          setCachedFormikState={props.setCachedFormikState}
          setSelectedComponentId={props.setSelectedComponentId}
        />
      }
    />
  );
}
