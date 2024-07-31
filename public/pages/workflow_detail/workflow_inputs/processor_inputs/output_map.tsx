/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  IConfigField,
  ML_INFERENCE_DOCS_LINK,
  ModelOutputFormField,
} from '../../../../../common';
import { MapArrayField } from '../input_fields';

/**
 * Component to configure the output map for an ML inference processor
 */

interface OutputMapProps {
  outputMapField: IConfigField;
  outputMapFieldPath: string;
  outputFields: ModelOutputFormField[];
  onFormChange: () => void;
}

export function OutputMap(props: OutputMapProps) {
  return (
    <MapArrayField
      field={props.outputMapField}
      fieldPath={props.outputMapFieldPath}
      label="Output Map"
      helpText={`An array specifying how to map the model’s output to new document fields.`}
      helpLink={ML_INFERENCE_DOCS_LINK}
      keyPlaceholder="New document field"
      valuePlaceholder="Model output field"
      onFormChange={props.onFormChange}
      valueOptions={props.outputFields}
    />
  );
}
