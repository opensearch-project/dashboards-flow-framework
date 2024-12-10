/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiText,
  EuiButtonIcon,
  RIGHT_ALIGNMENT,
  EuiInMemoryTable,
  EuiPanel,
} from '@elastic/eui';
import { customStringify, SearchHit } from '../../../common';

interface ResultsTableProps {
  hits: SearchHit[];
}

/**
 * Small component to display a list of search results with pagination.
 * Wrapped in a flexible panel with overflow handling.
 */
export function ResultsTable(props: ResultsTableProps) {
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{
    [itemId: string]: any;
  }>({});

  const toggleDetails = (hit: SearchHit) => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMapValues[hit._id]) {
      delete itemIdToExpandedRowMapValues[hit._id];
    } else {
      itemIdToExpandedRowMapValues[hit._id] = (
        <EuiText>{customStringify(hit._source)}</EuiText>
      );
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      paddingSize="none"
      style={{ height: '10vh', overflowY: 'scroll' }}
    >
      <EuiInMemoryTable
        itemId="_id"
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        items={props.hits}
        isExpandable={true}
        compressed={true}
        pagination={true}
        tableLayout="auto"
        columns={[
          {
            field: '_id',
            name: '',
            sortable: false,
            render: (_, item: SearchHit) => {
              return (
                <EuiText size="s">{customStringify(item._source)}</EuiText>
              );
            },
          },
          {
            align: RIGHT_ALIGNMENT,
            width: '40px',
            isExpander: true,
            render: (item: SearchHit) => (
              <EuiButtonIcon
                onClick={() => toggleDetails(item)}
                aria-label={
                  itemIdToExpandedRowMap[item._id] ? 'Collapse' : 'Expand'
                }
                iconType={
                  itemIdToExpandedRowMap[item._id] ? 'arrowUp' : 'arrowDown'
                }
              />
            ),
          },
        ]}
      />
    </EuiPanel>
  );
}
