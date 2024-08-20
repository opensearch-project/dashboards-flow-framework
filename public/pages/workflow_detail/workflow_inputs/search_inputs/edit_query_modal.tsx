/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import {
  QUERY_PRESETS,
  QueryPreset,
  WorkflowFormValues,
} from '../../../../../common';

interface EditQueryModalProps {
  queryFieldPath: string;
  setModalOpen(isOpen: boolean): void;
}

/**
 * Basic modal for configuring a query. Provides a dropdown to select from
 * a set of pre-defined queries targeted for different use cases.
 */
export function EditQueryModal(props: EditQueryModalProps) {
  // Form state
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();

  // selected preset state
  const [queryPreset, setQueryPreset] = useState<string | undefined>(undefined);

  // if the current query matches some preset, display the preset name as the selected
  // option in the dropdown. only execute when first rendering so it isn't triggered
  // when users are updating the underlying value in the JSON editor.
  useEffect(() => {
    setQueryPreset(
      QUERY_PRESETS.find(
        (preset) => preset.query === getIn(values, props.queryFieldPath)
      )?.name
    );
  }, []);

  return (
    <EuiModal
      onClose={() => props.setModalOpen(false)}
      style={{ width: '70vw' }}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Edit query`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText color="subdued">
          Start with a preset or enter manually.
        </EuiText>{' '}
        <EuiSpacer size="s" />
        <EuiSuperSelect
          options={QUERY_PRESETS.map(
            (preset: QueryPreset) =>
              ({
                value: preset.name,
                inputDisplay: (
                  <>
                    <EuiText size="s">{preset.name}</EuiText>
                  </>
                ),
                dropdownDisplay: <EuiText size="s">{preset.name}</EuiText>,
                disabled: false,
              } as EuiSuperSelectOption<string>)
          )}
          valueOfSelected={queryPreset || ''}
          onChange={(option: string) => {
            setQueryPreset(option);
            setFieldValue(
              props.queryFieldPath,
              QUERY_PRESETS.find((preset) => preset.name === option)?.query
            );
          }}
          isInvalid={false}
        />
        <EuiSpacer size="s" />
        <JsonField
          label="Query"
          fieldPath={props.queryFieldPath}
          editorHeight="25vh"
          readOnly={false}
        />
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton
          onClick={() => props.setModalOpen(false)}
          fill={false}
          color="primary"
        >
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
