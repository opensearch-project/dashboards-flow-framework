/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import { IConfigField, WorkflowConfig } from '../../../../../common';
import { JsonField } from '../input_fields';

interface AdvancedSettingsProps {
  uiConfig: WorkflowConfig;
  onFormChange: () => void;
}

/**
 * Input component for configuring ingest-side advanced settings
 */
export function AdvancedSettings(props: AdvancedSettingsProps) {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiAccordion id="advancedSettings" buttonContent="Advanced settings">
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <JsonField
                field={props.uiConfig.ingest.index?.mappings as IConfigField}
                fieldPath={'ingest.index.mappings'}
                onFormChange={props.onFormChange}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <JsonField
                field={props.uiConfig.ingest.index?.settings as IConfigField}
                fieldPath={'ingest.index.settings'}
                onFormChange={props.onFormChange}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
