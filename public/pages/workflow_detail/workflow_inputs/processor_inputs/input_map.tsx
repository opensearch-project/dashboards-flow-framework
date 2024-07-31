/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  IConfigField,
  ML_INFERENCE_DOCS_LINK,
  ModelInputFormField,
} from '../../../../../common';
import { MapArrayField } from '../input_fields';

/**
 * Component to configure the input map for an ML inference processor
 */

interface InputMapProps {
  inputMapField: IConfigField;
  inputMapFieldPath: string;
  inputFields: ModelInputFormField[];
  onFormChange: () => void;
}

export function InputMap(props: InputMapProps) {
  return (
    <MapArrayField
      field={props.inputMapField}
      fieldPath={props.inputMapFieldPath}
      label="Input Map"
      helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
      helpLink={ML_INFERENCE_DOCS_LINK}
      keyPlaceholder="Model input field"
      valuePlaceholder="Document field"
      onFormChange={props.onFormChange}
      keyOptions={props.inputFields}
    />
  );
}
