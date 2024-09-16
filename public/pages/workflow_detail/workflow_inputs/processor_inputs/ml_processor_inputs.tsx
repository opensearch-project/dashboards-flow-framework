/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { flattie } from 'flattie';
import {
  EuiAccordion,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  WorkflowFormValues,
  ModelInterface,
  IndexMappings,
} from '../../../../../common';
import { MapArrayField, ModelField } from '../input_fields';
import { InputTransformModal } from './input_transform_modal';
import { OutputTransformModal } from './output_transform_modal';
import { AppState, getMappings, useAppDispatch } from '../../../../store';
import {
  formikToPartialPipeline,
  getDataSourceId,
  parseModelInputs,
  parseModelOutputs,
} from '../../../../utils';
import { ConfigFieldList } from '../config_field_list';

interface MLProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  context: PROCESSOR_CONTEXT;
}

/**
 * Component to render ML processor inputs, including the model selection, and the
 * optional configurations of input maps and output maps. We persist any model interface
 * state here as well, to propagate expected model inputs / outputs to to the input map /
 * output map configuration forms, respectively.
 */
export function MLProcessorInputs(props: MLProcessorInputsProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const models = useSelector((state: AppState) => state.ml.models);
  const indices = useSelector((state: AppState) => state.opensearch.indices);
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // extracting field info from the ML processor config
  // TODO: have a better mechanism for guaranteeing the expected fields/config instead of hardcoding them here
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const inputMapField = props.config.fields.find(
    (field) => field.id === 'input_map'
  ) as IConfigField;
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${inputMapField.id}`;
  const inputMapValue = getIn(values, inputMapFieldPath);
  const outputMapField = props.config.fields.find(
    (field) => field.id === 'output_map'
  ) as IConfigField;
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.${outputMapField.id}`;
  const outputMapValue = getIn(values, outputMapFieldPath);
  const fullResponsePath = getIn(
    values,
    `${props.baseConfigPath}.${props.config.id}.full_response_path`
  );

  // preview availability states
  // if there are preceding search request processors, we cannot fetch and display the interim transformed query.
  // additionally, cannot preview output transforms for search request processors because output_maps need to be defined
  // (internally, we remove any output map to get the raw transforms from input_map, but this is not possible here)
  // in these cases, we block preview
  // ref tracking issue: https://github.com/opensearch-project/OpenSearch/issues/14745
  const [isInputPreviewAvailable, setIsInputPreviewAvailable] = useState<
    boolean
  >(true);
  const isOutputPreviewAvailable =
    props.context !== PROCESSOR_CONTEXT.SEARCH_REQUEST;
  useEffect(() => {
    if (props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST) {
      const curSearchPipeline = formikToPartialPipeline(
        values,
        props.uiConfig,
        props.config.id,
        false,
        PROCESSOR_CONTEXT.SEARCH_REQUEST
      );
      setIsInputPreviewAvailable(curSearchPipeline === undefined);
    }
  }, [props.uiConfig.search.enrichRequest.processors]);

  // advanced transformations modal state
  const [isInputTransformModalOpen, setIsInputTransformModalOpen] = useState<
    boolean
  >(false);
  const [isOutputTransformModalOpen, setIsOutputTransformModalOpen] = useState<
    boolean
  >(false);

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // Hook to listen when the selected model has changed. We do a few checks here:
  // 1: update model interface states
  // 2. clear out any persisted input_map/output_map form values, as those would now be invalid
  function onModelChange(modelId: string) {
    setModelInterface(models[modelId]?.interface);
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
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models]);

  // persisting doc/query/index mapping fields to collect a list
  // of options to display in the dropdowns when configuring input / output maps
  const [docFields, setDocFields] = useState<{ label: string }[]>([]);
  const [queryFields, setQueryFields] = useState<{ label: string }[]>([]);
  const [indexMappingFields, setIndexMappingFields] = useState<
    { label: string }[]
  >([]);
  useEffect(() => {
    try {
      const docObjKeys = Object.keys(
        flattie((JSON.parse(values.ingest.docs) as {}[])[0])
      );
      if (docObjKeys.length > 0) {
        setDocFields(
          docObjKeys.map((key) => {
            return {
              label: key,
            };
          })
        );
      }
    } catch {}
  }, [values?.ingest?.docs]);
  useEffect(() => {
    try {
      const queryObjKeys = Object.keys(
        flattie(JSON.parse(values.search.request))
      );
      if (queryObjKeys.length > 0) {
        setQueryFields(
          queryObjKeys.map((key) => {
            return {
              label: key,
            };
          })
        );
      }
    } catch {}
  }, [values?.search?.request]);
  useEffect(() => {
    const indexName = values?.search?.index?.name as string | undefined;
    if (indexName !== undefined && indices[indexName] !== undefined) {
      dispatch(
        getMappings({
          index: indexName,
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp: IndexMappings) => {
          const mappingsObjKeys = Object.keys(resp.properties);
          if (mappingsObjKeys.length > 0) {
            setIndexMappingFields(
              mappingsObjKeys.map((key) => {
                return {
                  label: key,
                  type: resp.properties[key]?.type,
                };
              })
            );
          }
        });
    }
  }, [values?.search?.index?.name]);

  return (
    <>
      {isInputTransformModalOpen && (
        <InputTransformModal
          uiConfig={props.uiConfig}
          config={props.config}
          baseConfigPath={props.baseConfigPath}
          context={props.context}
          inputMapField={inputMapField}
          inputMapFieldPath={inputMapFieldPath}
          modelInterface={modelInterface}
          valueOptions={
            props.context === PROCESSOR_CONTEXT.INGEST
              ? docFields
              : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
              ? queryFields
              : indexMappingFields
          }
          onClose={() => setIsInputTransformModalOpen(false)}
        />
      )}
      {isOutputTransformModalOpen && (
        <OutputTransformModal
          uiConfig={props.uiConfig}
          config={props.config}
          baseConfigPath={props.baseConfigPath}
          context={props.context}
          outputMapField={outputMapField}
          outputMapFieldPath={outputMapFieldPath}
          modelInterface={modelInterface}
          onClose={() => setIsOutputTransformModalOpen(false)}
        />
      )}
      <ModelField
        field={modelField}
        fieldPath={modelFieldPath}
        hasModelInterface={modelInterface !== undefined}
        onModelChange={onModelChange}
      />
      {!isEmpty(getIn(values, modelFieldPath)?.id) && (
        <>
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Configure input transformations (${
                props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                  ? 'Required'
                  : 'Optional'
              })`}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip
                content={
                  isInputPreviewAvailable
                    ? 'Preview transformations to model inputs'
                    : 'Preview is unavailable for multiple search request processors'
                }
              >
                <EuiSmallButtonEmpty
                  disabled={!isInputPreviewAvailable}
                  style={{ width: '100px', paddingTop: '8px' }}
                  onClick={() => {
                    setIsInputTransformModalOpen(true);
                  }}
                >
                  Preview
                </EuiSmallButtonEmpty>
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <EuiSpacer size="s" />
          <MapArrayField
            field={inputMapField}
            fieldPath={inputMapFieldPath}
            label="Input Map"
            helpText={`An array specifying how to map fields from the ingested document to the model’s input. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
            root object selector "${JSONPATH_ROOT_SELECTOR}"`}
            helpLink={ML_INFERENCE_DOCS_LINK}
            keyPlaceholder="Model input field"
            keyOptions={parseModelInputs(modelInterface)}
            valuePlaceholder={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Query field'
                : 'Document field'
            }
            valueOptions={
              props.context === PROCESSOR_CONTEXT.INGEST
                ? docFields
                : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? queryFields
                : indexMappingFields
            }
          />
          <EuiSpacer size="l" />
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Configure output transformations (${
                props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                  ? 'Required'
                  : 'Optional'
              })`}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip
                content={
                  isOutputPreviewAvailable
                    ? 'Preview transformations of model outputs'
                    : 'Preview of model outputs is unavailable for search request processors'
                }
              >
                <EuiSmallButtonEmpty
                  disabled={!isOutputPreviewAvailable}
                  style={{ width: '100px', paddingTop: '8px' }}
                  onClick={() => {
                    setIsOutputTransformModalOpen(true);
                  }}
                >
                  Preview
                </EuiSmallButtonEmpty>
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <MapArrayField
            field={outputMapField}
            fieldPath={outputMapFieldPath}
            label="Output Map"
            helpText={`An array specifying how to map the model’s output to new document fields. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
            root object selector "${JSONPATH_ROOT_SELECTOR}"`}
            helpLink={ML_INFERENCE_DOCS_LINK}
            keyPlaceholder={
              props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                ? 'Query field'
                : 'New document field'
            }
            valuePlaceholder="Model output field"
            valueOptions={
              fullResponsePath
                ? undefined
                : parseModelOutputs(modelInterface, false)
            }
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
          {props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST &&
            (inputMapValue.length === 0 || outputMapValue.length === 0) && (
              <EuiCallOut
                size="s"
                title="Input and output maps are required for ML inference search request processors"
                iconType={'alert'}
                color="danger"
              />
            )}
          <EuiSpacer size="s" />
          <EuiAccordion
            id={`advancedSettings${props.config.id}`}
            buttonContent="Advanced settings"
            paddingSize="none"
          >
            <EuiSpacer size="s" />
            <ConfigFieldList
              configId={props.config.id}
              configFields={props.config.optionalFields || []}
              baseConfigPath={props.baseConfigPath}
            />
          </EuiAccordion>
        </>
      )}
    </>
  );
}
