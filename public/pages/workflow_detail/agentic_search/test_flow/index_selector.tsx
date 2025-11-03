/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiBadge,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import {
  AppState,
  useAppDispatch,
  getIndex,
  catIndices,
} from '../../../../store';
import { getDataSourceId } from '../../../../utils';
import {
  AGENT_TYPE,
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowFormValues,
} from '../../../../../common';
import { IndexDetailsModal } from './index_details_modal';

const MAX_INDEX_BADGE_WIDTH = '200px';

interface IndexSelectorProps {
  agentType?: AGENT_TYPE;
}

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

  const [isSelectingIndex, setIsSelectingIndex] = useState<boolean>(false);

  // Fetch indices on initial load
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);
  const [indexOptions, setIndexOptions] = useState<
    EuiComboBoxOptionOption<string>[]
  >([]);

  // Optionally add an "ALL INDICES" option for eligible agent types (conversational)
  useEffect(() => {
    let eligibleIndexOptions = [
      ...Object.values(indices || {})
        .filter((index) => !index.name.startsWith('.')) // Filter out system indices
        .map((index) => ({
          value: index.name,
          label: index.name,
        })),
    ];
    if (props.agentType === AGENT_TYPE.CONVERSATIONAL) {
      eligibleIndexOptions = [
        {
          label: ALL_INDICES,
          value: '',
        },
        ...eligibleIndexOptions,
      ];
    }
    setIndexOptions(eligibleIndexOptions);
  }, [indices, props.agentType]);

  return (
    <>
      {indexOptions.length !== 0 && (
        <>
          {isDetailsModalVisible && (
            <IndexDetailsModal
              onClose={() => setIsDetailsModalVisible(false)}
              indexName={selectedIndexName}
            />
          )}
          <EuiFlexGroup gutterSize="xs" direction="row" alignItems="center">
            <EuiFlexItem>
              {isSelectingIndex ? (
                <EuiComboBox
                  data-testid="indexSelector"
                  style={{ width: '400px' }}
                  singleSelection={{ asPlainText: true }}
                  options={indexOptions}
                  selectedOptions={
                    isEmpty(selectedIndexName)
                      ? props.agentType === AGENT_TYPE.FLOW ||
                        isEmpty(props.agentType)
                        ? []
                        : [{ label: ALL_INDICES, value: '' }]
                      : [{ label: selectedIndexName, value: selectedIndexName }]
                  }
                  onChange={(options) => {
                    const value = getIn(options, '0.value', '') as string;
                    setFieldValue(INDEX_NAME_PATH, value);
                    setFieldTouched(INDEX_NAME_PATH, true);
                    setIsSelectingIndex(false);
                  }}
                  onBlur={() => setIsSelectingIndex(false)}
                  compressed
                  autoFocus
                  isClearable={false}
                />
              ) : (
                <EuiBadge
                  data-testid="indexBadge"
                  iconType={'documents'}
                  iconSide="left"
                  onClick={() => {
                    setIsSelectingIndex(true);
                  }}
                  color="hollow"
                  onClickAriaLabel="Open index selector"
                  aria-label="Index badge"
                  style={{
                    maxWidth: MAX_INDEX_BADGE_WIDTH,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isEmpty(selectedIndexName) ? ALL_INDICES : selectedIndexName}
                </EuiBadge>
              )}
            </EuiFlexItem>
            {!isEmpty(selectedIndexName) && (
              <EuiFlexItem grow={false}>
                <EuiSmallButtonIcon
                  iconType="inspect"
                  onClick={async () => {
                    await dispatch(
                      getIndex({ index: selectedIndexName, dataSourceId })
                    )
                      .unwrap()
                      .then(() => {
                        setIsDetailsModalVisible(true);
                      });
                  }}
                  aria-label="View index details"
                  data-testid="viewIndexDetailsButton"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      )}
    </>
  );
}
