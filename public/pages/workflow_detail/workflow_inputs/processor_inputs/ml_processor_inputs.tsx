/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getIn, useFormikContext } from 'formik';
import {
  EuiButton,
  EuiFilterButton,
  EuiFilterGroup,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  WorkspaceFormValues,
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  JSONPATH_ROOT_SELECTOR,
} from '../../../../../common';
import { MapField, ModelField } from '../input_fields';
import { isEmpty } from 'lodash';
import { InputTransformModal } from './input_transform_modal';
import { OutputTransformModal } from './output_transform_modal';

interface MLProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  onFormChange: () => void;
  context: PROCESSOR_CONTEXT;
}

/**
 * Component to render ML processor inputs. Offers simple and advanced flows for configuring data transforms
 * before and after executing an ML inference request
 */
export function MLProcessorInputs(props: MLProcessorInputsProps) {
  const { values } = useFormikContext<WorkspaceFormValues>();

  // extracting field info from the ML processor config
  // TODO: have a better mechanism for guaranteeing the expected fields/config instead of hardcoding them here
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const inputMapField = props.config.fields.find(
    (field) => field.id === 'inputMap'
  ) as IConfigField;
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${inputMapField.id}`;
  const outputMapField = props.config.fields.find(
    (field) => field.id === 'outputMap'
  ) as IConfigField;
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${outputMapField.id}`;

  // advanced transformations modal state
  const [isInputTransformModalOpen, setIsInputTransformModalOpen] = useState<
    boolean
  >(false);
  const [isOutputTransformModalOpen, setIsOutputTransformModalOpen] = useState<
    boolean
  >(false);

  // advanced / simple transform state
  const [isSimpleTransformSelected, setIsSimpleTransformSelected] = useState<
    boolean
  >(true);

  return (
    <>
      {isInputTransformModalOpen && (
        <InputTransformModal
          uiConfig={props.uiConfig}
          config={props.config}
          context={props.context}
          inputMapField={inputMapField}
          inputMapFieldPath={inputMapFieldPath}
          onFormChange={props.onFormChange}
          onClose={() => setIsInputTransformModalOpen(false)}
        />
      )}
      {isOutputTransformModalOpen && (
        <OutputTransformModal
          onClose={() => setIsOutputTransformModalOpen(false)}
          onConfirm={() => {
            console.log('saving transform output configuration...');
            setIsOutputTransformModalOpen(false);
          }}
        />
      )}
      <ModelField
        field={modelField}
        fieldPath={modelFieldPath}
        onFormChange={props.onFormChange}
      />
      {!isEmpty(getIn(values, modelFieldPath)?.id) && (
        <>
          <EuiSpacer size="s" />
          <EuiText size="s">{`Configure data transformations (optional)`}</EuiText>
          <EuiText size="s" color="subdued">
            {`Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
                root object selector "${JSONPATH_ROOT_SELECTOR}"`}
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFilterGroup>
            <EuiFilterButton
              grow={false}
              hasActiveFilters={isSimpleTransformSelected}
              onClick={() => setIsSimpleTransformSelected(true)}
            >
              Simple
            </EuiFilterButton>
            <EuiFilterButton
              grow={false}
              hasActiveFilters={!isSimpleTransformSelected}
              onClick={() => setIsSimpleTransformSelected(false)}
            >
              Advanced
            </EuiFilterButton>
          </EuiFilterGroup>
          <EuiSpacer size="s" />
          {isSimpleTransformSelected ? (
            <>
              <MapField
                field={inputMapField}
                fieldPath={inputMapFieldPath}
                label="Input map"
                helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                keyPlaceholder="Model input field"
                valuePlaceholder="Document field"
                onFormChange={props.onFormChange}
              />
              <EuiSpacer size="l" />
              <MapField
                field={outputMapField}
                fieldPath={outputMapFieldPath}
                label="Output map"
                helpText={`An array specifying how to map the model’s output to new fields.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                keyPlaceholder="New document field"
                valuePlaceholder="Model output field"
                onFormChange={props.onFormChange}
              />
            </>
          ) : (
            <>
              <EuiButton
                style={{ width: '200px' }}
                fill={false}
                onClick={() => {
                  setIsInputTransformModalOpen(true);
                }}
              >
                Configure input
              </EuiButton>
              <EuiSpacer size="s" />

              <EuiButton
                style={{ width: '200px' }}
                fill={false}
                onClick={() => {
                  setIsOutputTransformModalOpen(true);
                }}
              >
                Configure output
              </EuiButton>
            </>
          )}

          <EuiSpacer size="s" />
        </>
      )}
    </>
  );
}
