/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSelect,
  EuiFormRow,
  EuiToolTip,
  EuiIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
} from '@elastic/eui';
import { AppState, useAppDispatch, getIndex } from '../../../../store';
import { getDataSourceId } from '../../../../utils/utils';
import { catIndices } from '../../../../store';
import {
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowFormValues,
} from '../../../../../common';
import { IndexDetailsModal } from './index_details_modal';

interface IndexSelectorProps {}

export function IndexSelector(props: IndexSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(
    false
  );

  const { indices } = useSelector((state: AppState) => state.opensearch);

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
          Index
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
      {indexOptions.length === 0 ? (
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
        <>
          {isDetailsModalVisible && (
            <IndexDetailsModal
              onClose={() => setIsDetailsModalVisible(false)}
              indexName={getIn(values, 'search.index.name')}
            />
          )}
          <EuiFlexGroup gutterSize="s">
            <EuiFlexItem>
              <EuiSelect
                options={indexOptions}
                value={getIn(values, 'search.index.name')}
                onChange={(e) => {
                  const value = e.target.value;
                  setFieldValue('search.index.name', value);
                  setFieldTouched('search.index.name', true);
                }}
                aria-label="Select index"
                placeholder="Select an index"
                hasNoInitialSelection={isEmpty(
                  getIn(values, 'search.index.name')
                )}
                fullWidth
              />
            </EuiFlexItem>
            {!isEmpty(getIn(values, 'search.index.name')) && (
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={async () => {
                    const indexName = getIn(values, 'search.index.name');
                    await dispatch(getIndex({ index: indexName, dataSourceId }))
                      .unwrap()
                      .then(() => {
                        setIsDetailsModalVisible(true);
                      });
                  }}
                >
                  View details
                </EuiButtonEmpty>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      )}
    </EuiFormRow>
  );
}
