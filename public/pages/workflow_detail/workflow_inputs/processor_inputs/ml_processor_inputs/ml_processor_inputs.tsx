/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import {
  EuiAccordion,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiSmallButton,
  EuiIconTip,
  EuiLink,
} from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
  ModelInterface,
  EMPTY_INPUT_MAP_ENTRY,
  OutputMapEntry,
  OutputMapFormValue,
  OutputMapArrayFormValue,
  EMPTY_OUTPUT_MAP_ENTRY,
  ML_REMOTE_MODEL_LINK,
  FETCH_ALL_QUERY_LARGE,
} from '../../../../../../common';
import { ModelField } from '../../input_fields';
import {
  InputMapFormValue,
  InputMapArrayFormValue,
} from '../../../../../../common';
import { OverrideQueryModal } from './modals';
import { ModelInputs } from './model_inputs';
import { AppState, searchModels, useAppDispatch } from '../../../../../store';
import {
  formikToPartialPipeline,
  getDataSourceId,
  parseModelInputs,
  parseModelOutputs,
} from '../../../../../utils';
import { ConfigFieldList } from '../../config_field_list';
import { ModelOutputs } from './model_outputs';

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
  const { models } = useSelector((state: AppState) => state.ml);
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const modelIdFieldPath = `${modelFieldPath}.id`;
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.input_map`;
  const inputMapValue = getIn(values, inputMapFieldPath);
  const outputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.output_map`;
  const outputMapValue = getIn(values, outputMapFieldPath);
  const [modelNotFound, setModelNotFound] = useState<boolean>(false);

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

  // various modal states
  const [isQueryModalOpen, setIsQueryModalOpen] = useState<boolean>(false);

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // Hook to listen when the selected model has changed. We do a few checks here:
  // 1: update model interface states
  // 2. clear out any persisted input_map/output_map form values, as those would now be invalid
  function onModelChange(modelId: string) {
    const newModelInterface = models[modelId]?.interface;
    setModelInterface(newModelInterface);
    const modelInputsAsForm = [
      parseModelInputs(newModelInterface).map((modelInput) => {
        return {
          ...EMPTY_INPUT_MAP_ENTRY,
          key: modelInput.label,
        };
      }) as InputMapFormValue,
    ] as InputMapArrayFormValue;
    const modelOutputsAsForm = [
      parseModelOutputs(newModelInterface).map((modelOutput) => {
        return {
          ...EMPTY_OUTPUT_MAP_ENTRY,
          key: modelOutput.label,
        } as OutputMapEntry;
      }) as OutputMapFormValue,
    ] as OutputMapArrayFormValue;

    setFieldValue(inputMapFieldPath, modelInputsAsForm);
    setFieldValue(outputMapFieldPath, modelOutputsAsForm);
    setFieldTouched(inputMapFieldPath, false);
    setFieldTouched(outputMapFieldPath, false);
  }

  // Listener to detect on changes that could affect the model details, such as
  // any defined model interface, or if the model is not found.
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelIdFieldPath);
      if (modelId && models[modelId]) {
        setModelInterface(models[modelId]?.interface);
        setModelNotFound(false);
        // Edge case: model ID found, but no matching deployed model found in the cluster.
        // If so, persist a model-not-found state, and touch all fields to trigger UI elements
        // indicating errors for this particular processor.
      } else if (modelId) {
        setModelNotFound(true);
        setFieldValue(modelIdFieldPath, '');
        try {
          const processorConfigPath = `${props.baseConfigPath}.${props.config.id}`;
          Object.keys(
            getIn(values, `${props.baseConfigPath}.${props.config.id}`)
          ).forEach((modelFieldPath) => {
            setFieldTouched(`${processorConfigPath}.${modelFieldPath}`, true);
          });
        } catch (e) {}
      }
    }
  }, [models, getIn(values, modelIdFieldPath), props.uiConfig]);

  return (
    <>
      {modelNotFound && (
        <>
          <EuiCallOut
            color="danger"
            size="s"
            title={<EuiText size="s">Model not found</EuiText>}
          />
          <EuiSpacer size="s" />
        </>
      )}
      {isQueryModalOpen && (
        <OverrideQueryModal
          config={props.config}
          baseConfigPath={props.baseConfigPath}
          modelInterface={modelInterface}
          onClose={() => setIsQueryModalOpen(false)}
        />
      )}
      {isEmpty(models) ? (
        <EuiCallOut
          color="primary"
          size="s"
          title={
            <>
              <EuiText size="s">
                You have no models registered in your cluster.{' '}
                <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                  Learn more
                </EuiLink>{' '}
                about integrating ML models.
              </EuiText>
              <EuiSpacer size="s" />
              <EuiSmallButton
                iconType={'refresh'}
                iconSide="left"
                onClick={() => {
                  dispatch(
                    searchModels({
                      apiBody: FETCH_ALL_QUERY_LARGE,
                      dataSourceId,
                    })
                  );
                }}
              >
                Refresh
              </EuiSmallButton>
            </>
          }
        />
      ) : (
        <ModelField
          fieldPath={modelFieldPath}
          hasModelInterface={modelInterface !== undefined}
          onModelChange={onModelChange}
        />
      )}
      {!isEmpty(getIn(values, modelFieldPath)?.id) && (
        <>
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiText size="m">Inputs</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiIconTip
                    content={`Specify how to transform your input data into the input fields expected by the model.`}
                    position="right"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <ModelInputs
            config={props.config}
            baseConfigPath={props.baseConfigPath}
            uiConfig={props.uiConfig}
            context={props.context}
            isDataFetchingAvailable={isInputPreviewAvailable}
          />
          <EuiSpacer size="l" />
          <EuiFlexGroup direction="row" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Outputs`}</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIconTip
                content={`Specify how to transform your model outputs to new ${
                  props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                    ? 'query'
                    : 'document'
                } fields`}
                position="right"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <ModelOutputs
            config={props.config}
            baseConfigPath={props.baseConfigPath}
            uiConfig={props.uiConfig}
            context={props.context}
            isDataFetchingAvailable={isOutputPreviewAvailable}
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
          {props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST && (
            <>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Rewrite query`}</EuiText>
              <EuiSpacer size="s" />
              <EuiSmallButton
                style={{ width: '100px' }}
                fill={false}
                onClick={() => setIsQueryModalOpen(true)}
                data-testid="overrideQueryButton"
              >
                Rewrite
              </EuiSmallButton>
              <EuiSpacer size="l" />
            </>
          )}
          <EuiAccordion
            id={`advancedSettings${props.config.id}`}
            buttonContent="Advanced settings"
            paddingSize="none"
          >
            <EuiSpacer size="s" />
            <EuiFlexItem style={{ marginLeft: '28px' }}>
              <ConfigFieldList
                configId={props.config.id}
                configFields={(props.config.optionalFields || []).filter(
                  // we specially render the one_to_one field in <ModelInputs/>, hence we discard it here to prevent confusion.
                  (optionalField) => optionalField.id !== 'one_to_one'
                )}
                baseConfigPath={props.baseConfigPath}
              />
            </EuiFlexItem>
          </EuiAccordion>
        </>
      )}
    </>
  );
}
