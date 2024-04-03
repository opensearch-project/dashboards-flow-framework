/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiTab, EuiTabs } from '@elastic/eui';

/**
 * A helper component containing the togglable 'New' vs. 'Existing' tabs.
 */

interface NewOrExistingTabsProps {
  selectedTabId: string;
  setSelectedTabId(tabId: string): void;
}

const inputTabs = [
  {
    id: 'new',
    name: 'New',
    disabled: false,
  },
  {
    id: 'existing',
    name: 'Existing',
    disabled: true,
  },
];

export function NewOrExistingTabs(props: NewOrExistingTabsProps) {
  return (
    <EuiTabs size="s" expand={true}>
      {inputTabs.map((tab, idx) => {
        return (
          <EuiTab
            onClick={() => props.setSelectedTabId(tab.id)}
            isSelected={tab.id === props.selectedTabId}
            disabled={tab.disabled}
            key={idx}
          >
            {tab.name}
          </EuiTab>
        );
      })}
    </EuiTabs>
  );
}
