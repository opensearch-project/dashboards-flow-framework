/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { InputFieldList } from './input_field_list';
import { ReactFlowComponent } from '../../../../common';

interface ComponentInputsProps {
  selectedComponent: ReactFlowComponent;
  onFormChange: () => void;
}

export function ComponentInputs(props: ComponentInputsProps) {
  return (
    <>
      <EuiTitle size="m">
        <h2>{props.selectedComponent.data.label || ''}</h2>
      </EuiTitle>
      <EuiSpacer size="s" />
      <InputFieldList
        selectedComponent={props.selectedComponent}
        onFormChange={props.onFormChange}
      />
    </>
  );
}
