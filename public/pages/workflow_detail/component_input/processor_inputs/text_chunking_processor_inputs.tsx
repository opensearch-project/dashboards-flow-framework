/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import { EuiAccordion, EuiCallOut, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  TEXT_CHUNKING_ALGORITHM,
  FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS,
  DELIMITER_OPTIONAL_FIELDS,
  SHARED_OPTIONAL_FIELDS,
  WorkflowFormValues,
  MapFormValue,
  TEXT_CHUNKING_PROCESSOR_LINK,
} from '../../../../../common';
import { MapField, SelectField } from '../input_fields';
import { ConfigFieldList } from '../config_field_list';

interface TextChunkingProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  context: PROCESSOR_CONTEXT;
  disabled?: boolean;
}

/**
 * Specialized component to render the text chunking ingest processor. The list of optional
 * params we display is dependent on the source algorithm that is chosen. Internally, we persist
 * all of the params, but only choose the relevant ones when constructing the final ingest processor
 * template. This is to minimize the amount of ui config / form / schema updates we would need
 * to do if we only persisted the subset of optional params specific to the currently-chosen algorithm.
 */
export function TextChunkingProcessorInputs(
  props: TextChunkingProcessorInputsProps
) {
  const { values } = useFormikContext<WorkflowFormValues>();
  const disabled = props.disabled ?? false;

  // extracting field info from the text chunking processor config
  // TODO: have a better mechanism for guaranteeing the expected fields/config instead of hardcoding them here
  const algorithmFieldPath = `${props.baseConfigPath}.${props.config.id}.algorithm`;
  const algorithmField = props.config.fields.find(
    (field) => field.id === 'algorithm'
  ) as IConfigField;
  const fieldMapFieldPath = `${props.baseConfigPath}.${props.config.id}.field_map`;
  const fieldMapValue = getIn(values, fieldMapFieldPath) as MapFormValue;

  // algorithm optional fields state
  const [algorithmOptionalFields, setAlgorithmOptionalFields] = useState<
    string[]
  >(
    algorithmField !== undefined && algorithmField.value !== undefined
      ? algorithmField.value === TEXT_CHUNKING_ALGORITHM.FIXED_TOKEN_LENGTH
        ? FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS
        : DELIMITER_OPTIONAL_FIELDS
      : FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS
  );

  // Update the optional fields to display when the algorithm is changed
  function onAlgorithmChange(algorithm: string) {
    setAlgorithmOptionalFields(
      algorithm === TEXT_CHUNKING_ALGORITHM.FIXED_TOKEN_LENGTH
        ? FIXED_TOKEN_LENGTH_OPTIONAL_FIELDS
        : DELIMITER_OPTIONAL_FIELDS
    );
  }

  return (
    <>
      <SelectField
        field={algorithmField}
        fieldPath={algorithmFieldPath}
        onSelectChange={onAlgorithmChange}
        disabled={disabled}
        fullWidth={true}
      />
      <MapField
        label="Field map"
        helpLink={TEXT_CHUNKING_PROCESSOR_LINK}
        fieldPath={fieldMapFieldPath}
        keyPlaceholder={'Input field'}
        valuePlaceholder={'Output field'}
        disabled={disabled}
      />
      <EuiSpacer size="s" />
      {fieldMapValue?.length === 0 && (
        <>
          <EuiCallOut
            size="s"
            title="Field map cannot be empty"
            iconType={'alert'}
            color="danger"
          />
          <EuiSpacer size="s" />
        </>
      )}

      <EuiAccordion
        id={`advancedSettings${props.config.id}`}
        buttonContent="Advanced settings"
        paddingSize="none"
      >
        <EuiFlexItem>
          <EuiSpacer size="s" />
          <ConfigFieldList
            configId={props.config.id}
            // construct the final set of optional fields by combining the current
            // algorithm's set of optional fields, with the commonly shared fields
            configFields={[
              ...(props.config.optionalFields?.filter((optionalField) =>
                algorithmOptionalFields.includes(optionalField.id)
              ) || []),
              ...(props.config.optionalFields?.filter((optionalField) =>
                SHARED_OPTIONAL_FIELDS.includes(optionalField.id)
              ) || []),
            ]}
            baseConfigPath={props.baseConfigPath}
            disabled={disabled}
          />
        </EuiFlexItem>
      </EuiAccordion>
    </>
  );
}
