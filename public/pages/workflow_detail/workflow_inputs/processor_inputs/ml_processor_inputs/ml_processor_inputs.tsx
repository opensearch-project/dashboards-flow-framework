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
} from '@elastic/eui';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
  WorkflowFormValues,
  ModelInterface,
  EMPTY_INPUT_MAP_ENTRY,
  REQUEST_PREFIX,
  REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR,
  OutputMapEntry,
  OutputMapFormValue,
  OutputMapArrayFormValue,
  EMPTY_OUTPUT_MAP_ENTRY,
} from '../../../../../../common';
import { ModelField } from '../../input_fields';
import {
  InputMapFormValue,
  InputMapArrayFormValue,
} from '../../../../../../common';
import { OverrideQueryModal } from './modals';
import { ModelInputs } from './model_inputs';
import { AppState } from '../../../../../store';
import {
  formikToPartialPipeline,
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

  // on initial load of the models, update model interface states
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelIdFieldPath);
      if (modelId) {
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models]);

  return (
    <>
      {isQueryModalOpen && (
        <OverrideQueryModal
          config={props.config}
          baseConfigPath={props.baseConfigPath}
          modelInterface={modelInterface}
          onClose={() => setIsQueryModalOpen(false)}
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
          {props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST && (
            <>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Override query (Optional)`}</EuiText>
              <EuiSpacer size="s" />
              <EuiSmallButton
                style={{ width: '100px' }}
                fill={false}
                onClick={() => setIsQueryModalOpen(true)}
                data-testid="overrideQueryButton"
              >
                Override
              </EuiSmallButton>
              <EuiSpacer size="l" />
            </>
          )}
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiText size="m">Inputs</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiIconTip
                    content={`Specify a ${
                      props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                        ? 'query'
                        : 'document'
                    } field or define JSONPath to transform the ${
                      props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                        ? 'query'
                        : 'document'
                    } to map to a model input field.${
                      props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE
                        ? ` Or, if you'd like to include data from the the original query request, prefix your mapping with "${REQUEST_PREFIX}" or "${REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR}" - for example, "_request.query.match.my_field"`
                        : ''
                    }`}
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
          <EuiFlexGroup direction="row" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiText
                size="m"
                style={{ marginTop: '4px' }}
              >{`Outputs`}</EuiText>
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
