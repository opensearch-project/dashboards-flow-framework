/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import {
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
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
  ModelInputFormField,
  ModelOutputFormField,
  ML_INFERENCE_DOCS_LINK,
} from '../../../../../common';
import { MapArrayField, ModelField } from '../input_fields';
import { isEmpty } from 'lodash';
import { InputTransformModal } from './input_transform_modal';
import { OutputTransformModal } from './output_transform_modal';
import { AppState } from '../../../../store';
import { parseModelInputs, parseModelOutputs } from '../../../../utils';

interface MLProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  onFormChange: () => void;
  context: PROCESSOR_CONTEXT;
}

/**
 * Component to render ML processor inputs, including the model selection, and the
 * optional configurations of input maps and output maps. We persist any model interface
 * state here as well, to propagate expected model inputs / outputs to to the input map /
 * output map configuration forms, respectively.
 */
export function MLProcessorInputs(props: MLProcessorInputsProps) {
  const models = useSelector((state: AppState) => state.models.models);
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkspaceFormValues
  >();

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
  const inputMapValue = getIn(values, inputMapFieldPath);
  const outputMapField = props.config.fields.find(
    (field) => field.id === 'outputMap'
  ) as IConfigField;
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${outputMapField.id}`;
  const outputMapValue = getIn(values, outputMapFieldPath);

  // advanced transformations modal state
  const [isInputTransformModalOpen, setIsInputTransformModalOpen] = useState<
    boolean
  >(false);
  const [isOutputTransformModalOpen, setIsOutputTransformModalOpen] = useState<
    boolean
  >(false);

  // model interface state
  const [hasModelInterface, setHasModelInterface] = useState<boolean>(true);
  const [inputFields, setInputFields] = useState<ModelInputFormField[]>([]);
  const [outputFields, setOutputFields] = useState<ModelOutputFormField[]>([]);

  // Hook to listen when the selected model has changed. We do a few checks here:
  // 1: update model interface states
  // 2. clear out any persisted inputMap/outputMap form values, as those would now be invalid
  function onModelChange(modelId: string) {
    updateModelInterfaceStates(modelId);
    setFieldValue(inputMapFieldPath, []);
    setFieldValue(outputMapFieldPath, []);
    setFieldTouched(inputMapFieldPath, false);
    setFieldTouched(outputMapFieldPath, false);
  }

  // on initial load of the models, update model interface states
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, `${modelFieldPath}.id`);
      if (modelId) {
        updateModelInterfaceStates(modelId);
      }
    }
  }, [models]);

  // reusable function to update interface states based on the model ID
  function updateModelInterfaceStates(modelId: string) {
    const newSelectedModel = models[modelId];
    if (newSelectedModel?.interface !== undefined) {
      setInputFields(parseModelInputs(newSelectedModel.interface));
      setOutputFields(parseModelOutputs(newSelectedModel.interface));
      setHasModelInterface(true);
    } else {
      setInputFields([]);
      setOutputFields([]);
      setHasModelInterface(false);
    }
  }

  return (
    <>
      {isInputTransformModalOpen && (
        <InputTransformModal
          uiConfig={props.uiConfig}
          config={props.config}
          context={props.context}
          inputMapField={inputMapField}
          inputMapFieldPath={inputMapFieldPath}
          inputFields={inputFields}
          onFormChange={props.onFormChange}
          onClose={() => setIsInputTransformModalOpen(false)}
        />
      )}
      {isOutputTransformModalOpen && (
        <OutputTransformModal
          uiConfig={props.uiConfig}
          config={props.config}
          context={props.context}
          outputMapField={outputMapField}
          outputMapFieldPath={outputMapFieldPath}
          outputFields={outputFields}
          onFormChange={props.onFormChange}
          onClose={() => setIsOutputTransformModalOpen(false)}
        />
      )}
      <ModelField
        field={modelField}
        fieldPath={modelFieldPath}
        hasModelInterface={hasModelInterface}
        onModelChange={onModelChange}
        onFormChange={props.onFormChange}
      />
      {!isEmpty(getIn(values, modelFieldPath)?.id) && (
        <>
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Configure input transformations (optional)`}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                style={{ width: '100px' }}
                size="s"
                onClick={() => {
                  setIsInputTransformModalOpen(true);
                }}
              >
                Preview
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <EuiText size="s" color="subdued">
            {`Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
                root object selector "${JSONPATH_ROOT_SELECTOR}"`}
          </EuiText>
          <EuiSpacer size="s" />
          <MapArrayField
            field={inputMapField}
            fieldPath={inputMapFieldPath}
            label="Input Map"
            helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
            helpLink={ML_INFERENCE_DOCS_LINK}
            keyPlaceholder="Model input field"
            valuePlaceholder="Document field"
            onFormChange={props.onFormChange}
            keyOptions={inputFields}
          />
          <EuiSpacer size="l" />
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Configure output transformations (optional)`}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                style={{ width: '100px' }}
                size="s"
                onClick={() => {
                  setIsOutputTransformModalOpen(true);
                }}
              >
                Preview
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <MapArrayField
            field={outputMapField}
            fieldPath={outputMapFieldPath}
            label="Output Map"
            helpText={`An array specifying how to map the model’s output to new document fields.`}
            helpLink={ML_INFERENCE_DOCS_LINK}
            keyPlaceholder="New document field"
            valuePlaceholder="Model output field"
            onFormChange={props.onFormChange}
            valueOptions={outputFields}
          />
          <EuiSpacer size="s" />
          {inputMapValue.length !== outputMapValue.length &&
            inputMapValue.length > 0 &&
            outputMapValue.length > 0 && (
              <EuiCallOut
                size="s"
                title="Input and output maps must have equal length if both are defined"
                iconType={'alert'}
                color="danger"
              />
            )}
        </>
      )}
    </>
  );
}
