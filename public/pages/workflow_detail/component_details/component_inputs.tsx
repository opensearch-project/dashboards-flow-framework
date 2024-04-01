/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { InputFieldList } from './input_field_list';
import { NODE_CATEGORY, ReactFlowComponent } from '../../../../common';
import { NewOrExistingTabs } from '../workspace/workspace_components/new_or_existing_tabs';

interface ComponentInputsProps {
  selectedComponent: ReactFlowComponent;
  onFormChange: () => void;
}

export function ComponentInputs(props: ComponentInputsProps) {
  // Tab state
  enum TAB {
    NEW = 'new',
    EXISTING = 'existing',
  }
  const [selectedTabId, setSelectedTabId] = useState<string>(TAB.NEW);

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
        <NewOrExistingTabs
          selectedTabId={selectedTabId}
          setSelectedTabId={setSelectedTabId}
        />
        <EuiSpacer size="s" />
        {selectedTabId === TAB.NEW && (
          <InputFieldList
            componentId={props.selectedComponent.id}
            componentFields={props.selectedComponent.data.createFields}
            onFormChange={props.onFormChange}
          />
        )}
        {selectedTabId === TAB.EXISTING && (
          <InputFieldList
            componentId={props.selectedComponent.id}
            componentFields={props.selectedComponent.data.fields}
            onFormChange={props.onFormChange}
          />
        )}
      </>
    );
  }
}
