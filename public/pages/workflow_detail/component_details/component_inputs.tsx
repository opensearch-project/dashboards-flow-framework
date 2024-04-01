/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { InputFieldList } from './input_field_list';
import { NODE_CATEGORY, ReactFlowComponent } from '../../../../common';

interface ComponentInputsProps {
  selectedComponent: ReactFlowComponent;
  onFormChange: () => void;
}

export function ComponentInputs(props: ComponentInputsProps) {
  // Have custom layouts for parent/group flows
  if (props.selectedComponent.type === NODE_CATEGORY.INGEST_GROUP) {
    return (
      <>
        <EuiTitle size="m">
          <h2>Ingest flow</h2>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          Configure a flow to transform your data as it is ingested into
          OpenSearch.
        </EuiText>
      </>
    );
  } else if (props.selectedComponent.type === NODE_CATEGORY.SEARCH_GROUP) {
    return (
      <>
        <EuiTitle size="m">
          <h2>Search flow</h2>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiText size="s">
          Configure a flow to transform input when searching against your
          OpenSearch cluster.
        </EuiText>
      </>
    );
  } else {
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
}
