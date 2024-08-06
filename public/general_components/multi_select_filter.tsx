/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFilterSelectItem,
  EuiFilterGroup,
  EuiPopover,
  EuiSmallFilterButton,
  EuiFlexItem,
} from '@elastic/eui';

// styling
import './general-component-styles.scss';

interface MultiSelectFilterProps {
  title: string;
  filters: EuiFilterSelectItem[];
  setSelectedFilters: (filters: EuiFilterSelectItem[]) => void;
}

/**
 * A general multi-select filter.
 */
export function MultiSelectFilter(props: MultiSelectFilterProps) {
  const [filters, setFilters] = useState(props.filters);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  function onButtonClick() {
    setIsPopoverOpen(!isPopoverOpen);
  }
  function onPopoverClose() {
    setIsPopoverOpen(false);
  }

  function updateFilter(index: number) {
    if (!filters[index]) {
      return;
    }
    const newFilters = [...filters];
    // @ts-ignore
    newFilters[index].checked =
      // @ts-ignore
      newFilters[index].checked === 'on' ? undefined : 'on';

    setFilters(newFilters);
    props.setSelectedFilters(
      // @ts-ignore
      newFilters.filter((filter) => filter.checked === 'on')
    );
  }

  return (
    <EuiFlexItem grow={false} className="multi-select-filter--width">
      <EuiFilterGroup>
        <EuiPopover
          button={
            <EuiSmallFilterButton
              iconType="arrowDown"
              onClick={onButtonClick}
              isSelected={isPopoverOpen}
              numFilters={filters.length}
              hasActiveFilters={
                // @ts-ignore
                !!filters.find((filter) => filter.checked === 'on')
              }
              numActiveFilters={
                // @ts-ignore
                filters.filter((filter) => filter.checked === 'on').length
              }
            >
              {props.title}
            </EuiSmallFilterButton>
          }
          isOpen={isPopoverOpen}
          closePopover={onPopoverClose}
          panelPaddingSize="none"
        >
          <div className="euiFilterSelect__items multi-select-filter--width">
            {filters.map((filter, index) => (
              <EuiFilterSelectItem
                // @ts-ignore
                checked={filter.checked}
                key={index}
                onClick={() => updateFilter(index)}
              >
                {/* @ts-ignore */}
                {filter.name}
              </EuiFilterSelectItem>
            ))}
          </div>
        </EuiPopover>
      </EuiFilterGroup>
    </EuiFlexItem>
  );
}
