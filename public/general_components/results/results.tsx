/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { get, isEmpty } from 'lodash';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButtonGroup,
} from '@elastic/eui';
import { SearchResponse, SimulateIngestPipelineDoc } from '../../../common';
import { ResultsTable } from './results_table';
import { ResultsJSON } from './results_json';
import { MLOutputs } from './ml_outputs';

interface ResultsProps {
  response: SearchResponse;
}

enum VIEW {
  HITS_TABLE = 'hits_table',
  ML_OUTPUTS = 'ml_outputs',
  RAW_JSON = 'raw_json',
}

/**
 * Basic component to view OpenSearch response results. Can view hits in a tabular format,
 * or the raw JSON response.
 */
export function Results(props: ResultsProps) {
  // hits state
  const [hits, setHits] = useState<SimulateIngestPipelineDoc[]>([]);
  useEffect(() => {
    setHits(props.response?.hits?.hits || []);
  }, [props.response]);

  // selected view state. auto-navigate to ML outputs if there is values found
  // in "ext.ml_inference" in the search response.
  const [selectedView, setSelectedView] = useState<VIEW>(VIEW.HITS_TABLE);
  useEffect(() => {
    if (!isEmpty(get(props.response, 'ext.ml_inference', {}))) {
      setSelectedView(VIEW.ML_OUTPUTS);
    }
  }, [props.response]);

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
                id: VIEW.ML_OUTPUTS,
                label: 'ML outputs',
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
            {selectedView === VIEW.HITS_TABLE && <ResultsTable hits={hits} />}
            {selectedView === VIEW.ML_OUTPUTS && (
              <MLOutputs
                mlOutputs={getMLResponseFromSearchResponse(props.response)}
              />
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

function getMLResponseFromSearchResponse(searchResponse: SearchResponse): {} {
  return get(searchResponse, 'ext.ml_inference', {});
}
