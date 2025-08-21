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

  // whenever the selected fields changes, if it changes the query fields, update the final query
  useEffect(() => {
    const finalQuery = (() => {
      try {
        return JSON.parse(getIn(values, 'search.request', '{}'));
      } catch (e) {
        return {};
      }
    })();
    if (
      finalQuery?.query?.agentic?.query_fields !== undefined &&
      !fieldArraysEqual(
        finalQuery?.query?.agentic?.query_fields,
        selectedFields
      )
    ) {
      const updatedQuery = cloneDeep(finalQuery);
      updatedQuery.query.agentic.query_fields = selectedFields.map(
        (option) => option.value
      );
      setFieldValue('search.request', customStringify(updatedQuery));
    }
  }, [selectedFields]);

  // whenever the query is updated, if it changes the query fields, update the selected fields
  useEffect(() => {
    const finalQuery = (() => {
      try {
        return JSON.parse(getIn(values, 'search.request', '{}'));
      } catch (e) {
        return {};
      }
    })();
    if (
      finalQuery?.query?.agentic?.query_fields !== undefined &&
      !fieldArraysEqual(
        finalQuery?.query?.agentic?.query_fields,
        selectedFields
      )
    ) {
      const curQueryFields = finalQuery?.query?.agentic?.query_fields;
      const curFieldOptions = getFieldOptions(fieldMappings);
      setSelectedFields(getNewFieldOptions(curQueryFields, curFieldOptions));
    } else {
    }
  }, [getIn(values, 'search.request')]);

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

// compare the rendered field options in the combo box, with the string list in the underlying DSL query.
// used for keeping them consistent across views, if the values differ as users edit the combo box list and/or the DSL query.
function fieldArraysEqual(
  queryFields: string[],
  comboBoxFields: EuiComboBoxOptionOption<string>[]
): boolean {
  if (!Array.isArray(queryFields) || !Array.isArray(comboBoxFields))
    return false;
  if (queryFields.length !== comboBoxFields.length) return false;

  for (let i = 0; i < queryFields.length; i++) {
    if (typeof queryFields[i] !== 'string') return false;
    if (!comboBoxFields[i] || typeof comboBoxFields[i].value !== 'string')
      return false;
    if (queryFields[i] !== comboBoxFields[i].value) return false;
  }

  return true;
}

// update the combo box options if the query field list in the DSL query is updated.
// add custom fields with unknown type if it is not in the known mappings options list.
function getNewFieldOptions(
  queryFields: string[],
  comboBoxFields: EuiComboBoxOptionOption<string>[]
): EuiComboBoxOptionOption<string>[] {
  const comboBoxMap = new Map(comboBoxFields.map((obj) => [obj.value, obj]));

  return (
    queryFields.map((str) => {
      if (comboBoxMap.has(str)) {
        return comboBoxMap.get(str) as EuiComboBoxOptionOption<string>;
      } else {
        return {
          label: str,
          value: str,
          type: undefined,
        } as EuiComboBoxOptionOption<string>;
      }
    }) || []
  );
}
