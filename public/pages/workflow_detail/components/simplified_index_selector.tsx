/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSelect,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
  EuiLoadingSpinner,
  EuiCallOut,
} from '@elastic/eui';
import { AppState, useAppDispatch } from '../../../store';
import { getDataSourceId } from '../../../utils/utils';
import { catIndices } from '../../../store';
import {
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowFormValues,
} from '../../../../common';

interface SimplifiedIndexSelectorProps {}

export function SimplifiedIndexSelector(props: SimplifiedIndexSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();

  const { indices, loading: opensearchLoading } = useSelector(
    (state: AppState) => state.opensearch
  );

  // Fetch indices on initial load
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  const indexOptions = Object.values(indices || {})
    .filter((index) => !index.name.startsWith('.')) // Filter out system indices
    .map((index) => ({
      value: index.name,
      text: index.name,
    }));

  return (
    <EuiFormRow
      label={
        <>
          Select Index
          <EuiToolTip content="Choose the index that contains the data you want to search">
            <EuiIcon
              type="questionInCircle"
              color="subdued"
              style={{ marginLeft: '4px' }}
            />
          </EuiToolTip>
        </>
      }
      fullWidth
    >
      {opensearchLoading ? (
        <EuiLoadingSpinner size="m" />
      ) : indexOptions.length === 0 ? (
        <EuiCallOut
          title="No indices available"
          color="warning"
          iconType="alert"
          size="s"
        >
          <p>
            No indices are available. Please create an index using the standard
            workflow interface first.
          </p>
        </EuiCallOut>
      ) : (
        <EuiSelect
          options={indexOptions}
          value={getIn(values, 'search.index.name')}
          onChange={(e) => {
            const value = e.target.value;
            setFieldValue('search.index.name', value);
          }}
          aria-label="Select index"
          placeholder="Select an index"
          hasNoInitialSelection={isEmpty(getIn(values, 'search.index.name'))}
          fullWidth
        />
      )}
    </EuiFormRow>
  );
}
