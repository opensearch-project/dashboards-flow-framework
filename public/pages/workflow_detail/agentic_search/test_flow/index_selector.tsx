/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSmallButtonIcon,
  EuiSuperSelect,
  EuiSuperSelectOption,
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

  // Fetch indices on initial load
  useEffect(() => {
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
  }, []);

  const [indexOptions, setIndexOptions] = useState<
    EuiSuperSelectOption<string>[]
  >([]);

  // Optionally add an "ALL INDICES" option for eligible agent types (conversational)
  useEffect(() => {
    let eligibleIndexOptions = Object.values(indices || {})
      .filter((index) => !index.name.startsWith('.')) // Filter out system indices
      .map((index) => ({
        value: index.name,
        inputDisplay: index.name,
        dropdownDisplay: index.name,
      }));

    if (props.agentType === AGENT_TYPE.CONVERSATIONAL) {
      eligibleIndexOptions = [
        {
          value: ALL_INDICES,
          inputDisplay: ALL_INDICES,
          dropdownDisplay: ALL_INDICES,
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
          <EuiSuperSelect
            data-testid="indexSelector"
            prepend="Index"
            append={
              !isEmpty(selectedIndexName) ? (
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
              ) : undefined
            }
            options={indexOptions}
            valueOfSelected={
              isEmpty(selectedIndexName)
                ? props.agentType === AGENT_TYPE.FLOW ||
                  isEmpty(props.agentType)
                  ? undefined
                  : ALL_INDICES
                : selectedIndexName
            }
            onChange={(value) => {
              if (value === ALL_INDICES) {
                value = '';
              }
              setFieldValue(INDEX_NAME_PATH, value);
              setFieldTouched(INDEX_NAME_PATH, true);
            }}
            placeholder="Select an index"
            compressed
            fullWidth
          />
        </>
      )}
    </>
  );
}
