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
  EuiCodeEditor,
  EuiPanel,
} from '@elastic/eui';
import { customStringify, SearchHit } from '../../../common';

interface ResultsTableProps {
  hits: SearchHit[];
}

/**
 * Small component to display a list of search results with pagination.
 * Can expand each entry to view the full _source response
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
        <EuiPanel
          style={{ height: '20vh' }}
          hasShadow={false}
          hasBorder={false}
          paddingSize="none"
        >
          <EuiCodeEditor
            mode="json"
            theme="textmate"
            width="100%"
            height="100%"
            value={customStringify(hit._source)}
            readOnly={true}
            setOptions={{
              fontSize: '12px',
              autoScrollEditorIntoView: true,
              wrap: true,
            }}
            tabSize={2}
          />
        </EuiPanel>
      );
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  return (
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
              <EuiText
                size="s"
                color="subdued"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  width: '20vw',
                }}
              >
                {customStringify(item._source)}
              </EuiText>
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
  );
}
