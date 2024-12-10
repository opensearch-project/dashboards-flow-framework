/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButtonGroup,
} from '@elastic/eui';
import { SearchResponse } from '../../../common';
import { ResultsTable } from './results_table';
import { ResultsJSON } from './results_json';

interface ResultsProps {
  response: SearchResponse;
}

enum VIEW {
  HITS_TABLE = 'hits_table',
  RAW_JSON = 'raw_json',
}

/**
 * Basic component to view OpenSearch response results. Can view hits in a tabular format,
 * or the raw JSON response.
 */
export function Results(props: ResultsProps) {
  // selected view state
  const [selectedView, setSelectedView] = useState<VIEW>(VIEW.HITS_TABLE);

  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      paddingSize="none"
      style={{ height: '10vh', overflowY: 'scroll', overflowX: 'hidden' }}
    >
      <EuiFlexGroup
        direction="column"
        gutterSize="xs"
        style={{ height: '100%' }}
      >
        <EuiFlexItem grow={false}>
          <EuiSmallButtonGroup
            legend="Choose how to view your data"
            options={[
              {
                id: VIEW.HITS_TABLE,
                label: 'Hits',
              },
              {
                id: VIEW.RAW_JSON,
                label: 'Raw JSON',
              },
            ]}
            idSelected={selectedView}
            onChange={(id) => setSelectedView(id as VIEW)}
            data-testid="resultsToggleButtonGroup"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <>
            {selectedView === VIEW.HITS_TABLE && (
              <ResultsTable hits={props.response?.hits?.hits || []} />
            )}
            {selectedView === VIEW.RAW_JSON && (
              <ResultsJSON response={props.response} />
            )}
          </>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
