/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowFormValues,
  ModelInterface,
} from '../../../../../../common';
import { MapArrayField } from '../../input_fields';

import { AppState } from '../../../../../store';
import { parseModelOutputs } from '../../../../../utils';

interface ModelOutputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  context: PROCESSOR_CONTEXT;
}

/**
 * Base component to configure ML outputs.
 */
export function ModelOutputs(props: ModelOutputsProps) {
  const { models } = useSelector((state: AppState) => state.ml);
  const { values } = useFormikContext<WorkflowFormValues>();

  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.output_map`;
  const fullResponsePath = getIn(
    values,
    `${props.baseConfigPath}.${props.config.id}.full_response_path`
  );

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // on initial load of the models, update model interface states
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelFieldPath)?.id;
      if (modelId) {
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models]);

  return (
    <MapArrayField
      fieldPath={outputMapFieldPath}
      keyTitle="Name"
      keyPlaceholder="Name"
      keyHelpText={`Specify a model output field or define JSONPath to transform the model output to map to a new document field.`}
      keyOptions={
        fullResponsePath ? undefined : parseModelOutputs(modelInterface, false)
      }
      valueTitle={
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'Query field'
          : 'New document field'
      }
      valuePlaceholder={
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'Specify a query field'
          : 'Define a document field'
      }
      addMapEntryButtonText="Add output"
      addMapButtonText="Add output group (Advanced)"
      mappingDirection="sortRight"
    />
  );
}
