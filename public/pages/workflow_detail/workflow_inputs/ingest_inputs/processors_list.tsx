/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { IConfig, Workflow } from '../../../../../common';
import { ConfigFieldList } from '../config_field_list';

interface ProcessorsListProps {
  workflow: Workflow;
  onFormChange: () => void;
}

/**
 * Input component for configuring ingest pipeline processors
 */
export function ProcessorsList(props: ProcessorsListProps) {
  return (
    <EuiFlexGroup direction="column">
      {props.workflow.ui_metadata?.config.ingest?.enrich.processors.map(
        (processor: IConfig, processorIndex) => {
          return (
            <EuiFlexItem key={processorIndex}>
              <EuiText>
                {processor.metadata?.label || 'Ingest processor'}
              </EuiText>
              <ConfigFieldList
                config={processor}
                baseConfigPath="ingest.enrich"
                onFormChange={props.onFormChange}
              />
            </EuiFlexItem>
          );
        }
      )}
    </EuiFlexGroup>
  );
}
