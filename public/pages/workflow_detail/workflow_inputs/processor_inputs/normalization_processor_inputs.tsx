/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiAccordion, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  NORMALIZATION_PROCESSOR_LINK,
} from '../../../../../common';
import { TextField } from '../input_fields';
import { ConfigFieldList } from '../config_field_list';

interface NormalizationProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  context: PROCESSOR_CONTEXT;
  disabled?: boolean;
}

/**
 * Specialized component to render the normalization processor. Adds some helper text around weights field,
 * and bubble it up as a primary field to populate (even though it is technically optional).
 * In the future, may have a more customizable / guided way for specifying the array of weights.
 * For example, could have some visual way of linking it to the underlying sub-queries in the query field,
 * enforce its length = the number of queries, etc.
 */
export function NormalizationProcessorInputs(
  props: NormalizationProcessorInputsProps
) {
  const disabled = props.disabled ?? false;
  // extracting field info from the config
  const optionalFields = props.config.optionalFields || [];
  const weightsFieldPath = `${props.baseConfigPath}.${props.config.id}.weights`;
  const optionalFieldsWithoutWeights = optionalFields.filter(
    (field) => field.id !== 'weights'
  );

  return (
    <>
      <TextField
        label={'Weights'}
        helpText={`A comma-separated array of floating-point values specifying the weight for each query. For example: '0.8, 0.2'`}
        helpLink={NORMALIZATION_PROCESSOR_LINK}
        fieldPath={weightsFieldPath}
        showError={true}
        disabled={disabled}
      />
      <EuiSpacer size="s" />
      <EuiAccordion
        id={`advancedSettings${props.config.id}`}
        buttonContent="Advanced settings"
        paddingSize="none"
        style={{ marginLeft: '-8px' }}
      >
        <EuiSpacer size="s" />
        <EuiFlexItem style={{ marginLeft: '28px' }}>
          <ConfigFieldList
            configId={props.config.id}
            configFields={optionalFieldsWithoutWeights}
            baseConfigPath={props.baseConfigPath}
            disabled={disabled}
          />
        </EuiFlexItem>
      </EuiAccordion>
    </>
  );
}
