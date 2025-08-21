/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { cloneDeep, get, isEmpty } from 'lodash';
import {
  EuiFormRow,
  EuiComboBox,
  EuiToolTip,
  EuiIcon,
  EuiComboBoxOptionOption,
} from '@elastic/eui';
import {
  customStringify,
  IndexMappings,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../common';
import { getMappings, useAppDispatch } from '../../../store';
import { getDataSourceId } from '../../../utils';

interface SimplifiedFieldSelectorProps {
  uiConfig: WorkflowConfig | undefined;
}

export function SimplifiedFieldSelector(props: SimplifiedFieldSelectorProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values, touched, setFieldValue } = useFormikContext<
    WorkflowFormValues
  >();
  const selectedIndexId = getIn(values, 'search.index.name', '') as string;
  const finalQuery = (() => {
    try {
      return JSON.parse(getIn(values, 'search.request', '{}'));
    } catch (e) {
      return {};
    }
  })();

  const [fieldMappings, setFieldMappings] = useState<any>(null);
  const [selectedFields, setSelectedFields] = useState<
    EuiComboBoxOptionOption<string>[]
  >([]);

  // whenever the index is populated (changed or initialized), fetch the latest index mappings
  useEffect(() => {
    if (!isEmpty(selectedIndexId)) {
      dispatch(getMappings({ index: selectedIndexId, dataSourceId }))
        .unwrap()
        .then((response: IndexMappings) => {
          setFieldMappings(response);
        })
        .catch((error) => {});
    } else {
      setFieldMappings(null);
    }
    if (!isEmpty(selectedIndexId) && touched?.search?.index?.name === true) {
      setSelectedFields([]);
    }
  }, [selectedIndexId]);

  // whenever the selected fields changes, update the final query
  useEffect(() => {
    if (finalQuery?.query?.agentic?.query_fields !== undefined) {
      const updatedQuery = cloneDeep(finalQuery);
      updatedQuery.query.agentic.query_fields = selectedFields.map(
        (option) => option.value
      );
      setFieldValue('search.request', customStringify(updatedQuery));
    }
  }, [selectedFields]);

  const getFieldOptions = (mappings: any) => {
    return Object.entries(get(mappings, 'properties', {})).map(
      ([fieldName, fieldInfo]: [string, any]) => {
        const fieldType = fieldInfo.type || 'object';
        return {
          label: `${fieldName} (${fieldType})`,
          value: fieldName,
          type: fieldType,
        } as EuiComboBoxOptionOption<string>;
      }
    );
  };

  return (
    <EuiFormRow
      label={
        <>
          <p>
            Query fields <i>{`(optional)`}</i>
            <EuiToolTip content="Specify the set of query fields you want to target in your final search">
              <EuiIcon
                type="questionInCircle"
                color="subdued"
                style={{ marginLeft: '4px' }}
              />
            </EuiToolTip>
          </p>
        </>
      }
      helpText="Choose specific fields to include in your query"
      fullWidth
    >
      <EuiComboBox
        placeholder="Select fields"
        options={getFieldOptions(fieldMappings)}
        selectedOptions={selectedFields}
        onChange={(options) => setSelectedFields(options)}
        onCreateOption={(searchValue, options) =>
          setSelectedFields([
            ...selectedFields,
            {
              label: searchValue,
              value: searchValue,
              type: undefined,
            } as EuiComboBoxOptionOption<string>,
          ])
        }
        isClearable={true}
        isDisabled={false}
        fullWidth
      />
    </EuiFormRow>
  );
}
