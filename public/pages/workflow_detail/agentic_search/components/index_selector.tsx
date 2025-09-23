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
  EuiToolTip,
  EuiIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiTitle,
  EuiSpacer,
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

const INDEX_NAME_PATH = 'search.index.name';
const ALL_INDICES = 'All indices';

export function IndexSelector(props: IndexSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();
  const selectedIndexName = getIn(values, INDEX_NAME_PATH);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(
    false
  );
  const { indices } = useSelector((state: AppState) => state.opensearch);

  // Fetch indices on initial load
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  const indexOptions = [
    {
      text: ALL_INDICES,
      value: '',
    },
    ...Object.values(indices || {})
      .filter((index) => !index.name.startsWith('.')) // Filter out system indices
      .map((index) => ({
        value: index.name,
        text: index.name,
      })),
  ];

  return (
    <>
      <EuiFlexGroup
        direction="row"
        justifyContent="spaceBetween"
        alignItems="center"
        style={{ paddingLeft: '2px' }}
      >
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row" gutterSize="none" alignItems="center">
            <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
              <EuiIcon type="document" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h5>Index</h5>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Choose the index that contains the data you want to search, or search against all indices.">
                <EuiIcon
                  type="questionInCircle"
                  color="subdued"
                  style={{ marginLeft: '4px' }}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="s"
                disabled={isEmpty(selectedIndexName)}
                onClick={async () => {
                  await dispatch(
                    getIndex({ index: selectedIndexName, dataSourceId })
                  )
                    .unwrap()
                    .then(() => {
                      setIsDetailsModalVisible(true);
                    });
                }}
              >
                View details
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
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
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem>
              <EuiSelect
                options={indexOptions}
                value={
                  isEmpty(selectedIndexName) ? ALL_INDICES : selectedIndexName
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFieldValue(INDEX_NAME_PATH, value);
                  setFieldTouched(INDEX_NAME_PATH, true);
                }}
                aria-label="Select index"
                hasNoInitialSelection={false}
                fullWidth
                compressed
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </>
  );
}
