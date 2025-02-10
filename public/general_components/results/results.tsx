/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { get } from 'lodash';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButtonGroup,
} from '@elastic/eui';
import { SearchResponse } from '../../../common';
import { ResultsTable } from './results_table';
import { ResultsJSON } from './results_json';
import { MLResponse } from './ml_response';

interface ResultsProps {
  response: SearchResponse;
}

enum VIEW {
  HITS_TABLE = 'hits_table',
  RAW_JSON = 'raw_json',
  ML_RESPONSE = 'ml_response',
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
              {
                id: VIEW.ML_RESPONSE,
                label: 'ML response',
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
            {selectedView === VIEW.ML_RESPONSE && (
              <MLResponse
                mlResponse={getMLResponseFromSearchResponse(props.response)}
              />
            )}
          </>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

function getMLResponseFromSearchResponse(searchResponse: SearchResponse): {} {
  return get(searchResponse, 'ext.ml_inference', {});
}
