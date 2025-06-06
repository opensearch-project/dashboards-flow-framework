/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import {
  EuiCompressedFormRow,
  EuiText,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiAccordion,
  EuiCompressedFieldText,
  EuiCompressedFieldNumber,
} from '@elastic/eui';
import {
  DEFAULT_IMAGE_FIELD,
  DEFAULT_LLM_RESPONSE_FIELD,
  DEFAULT_TEXT_FIELD,
  DEFAULT_VECTOR_FIELD,
  MODEL_STATE,
  Model,
  ModelInterface,
  QuickConfigureFields,
  WORKFLOW_TYPE,
  isRAGUseCase,
  isVectorSearchUseCase,
} from '../../../../common';
import { AppState } from '../../../store';
import { getEmbeddingModelDimensions, parseModelInputs } from '../../../utils';

interface QuickConfigureOptionalFieldsProps {
  workflowType?: WORKFLOW_TYPE;
  fields?: QuickConfigureFields; // the set of static/required fields permanently displayed in the modal. Includes all model info.
  setFields(fields: QuickConfigureFields): void;
}

// Dynamic list of optional quick-configuration fields based on the selected use case. Updates/adds
// to the parent QuickConfigureFields for auto-filling preset configurations.
export function QuickConfigureOptionalFields(
  props: QuickConfigureOptionalFieldsProps
) {
  const { models, connectors } = useSelector((state: AppState) => state.ml);

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<Model[]>([]);
  useEffect(() => {
    if (models) {
      setDeployedModels(
        Object.values(models || {}).filter(
          (model) => model.state === MODEL_STATE.DEPLOYED
        )
      );
    }
  }, [models]);

  // Local field values state
  const [optionalFieldValues, setOptionalFieldValues] = useState<
    QuickConfigureFields
  >({});

  // on initial load, set defaults for the field values for certain workflow types
  useEffect(() => {
    let defaultFieldValues = {} as QuickConfigureFields;
    switch (props.workflowType) {
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS:
      case WORKFLOW_TYPE.HYBRID_SEARCH: {
        defaultFieldValues = {
          textField: DEFAULT_TEXT_FIELD,
          vectorField: DEFAULT_VECTOR_FIELD,
        };
        break;
      }
      case WORKFLOW_TYPE.MULTIMODAL_SEARCH: {
        defaultFieldValues = {
          textField: DEFAULT_TEXT_FIELD,
          vectorField: DEFAULT_VECTOR_FIELD,
          imageField: DEFAULT_IMAGE_FIELD,
        };
        break;
      }
      case WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG:
      case WORKFLOW_TYPE.HYBRID_SEARCH_WITH_RAG: {
        defaultFieldValues = {
          textField: DEFAULT_TEXT_FIELD,
          vectorField: DEFAULT_VECTOR_FIELD,
          promptField: '',
          llmResponseField: DEFAULT_LLM_RESPONSE_FIELD,
        };
        break;
      }
      case WORKFLOW_TYPE.CUSTOM:
      default:
        break;
    }
    setOptionalFieldValues(defaultFieldValues);
  }, []);

  // Selected LLM interface state. Used for exposing a dropdown
  // of available model inputs to select from.
  const [selectedLLMInterface, setSelectedLLMInterface] = useState<
    ModelInterface | undefined
  >(undefined);
  useEffect(() => {
    if (props.fields?.llmId) {
      const selectedModel = deployedModels.find(
        (model) => model.id === props.fields?.llmId
      );
      setSelectedLLMInterface(selectedModel?.interface);
      setOptionalFieldValues({
        ...optionalFieldValues,
        promptField: get(parseModelInputs(selectedModel?.interface), '0.label'),
      });
    }
  }, [props.fields?.llmId, deployedModels, connectors]);

  // Override/add any optional fields set here
  useEffect(() => {
    props.setFields({ ...props.fields, ...optionalFieldValues });
  }, [optionalFieldValues]);

  // Keep track of if an embedding model is selected with an unknown embedding length.
  // Only expose the form field if it is unknown, else hide from the user.
  const [unknownEmbeddingLength, setUnknownEmbeddingLength] = useState<boolean>(
    false
  );
  useEffect(() => {
    const selectedModel = deployedModels.find(
      (model) => model.id === props.fields?.embeddingModelId
    );
    if (selectedModel?.connectorId !== undefined) {
      const connector = connectors[selectedModel.connectorId];
      if (connector !== undefined) {
        const dimensions = getEmbeddingModelDimensions(connector);
        setUnknownEmbeddingLength(dimensions === undefined);
      }
    }
  }, [props.fields?.embeddingModelId, deployedModels, connectors]);

  return (
    <EuiAccordion
      id="optionalConfiguration"
      buttonContent="Optional configuration"
      data-testid="optionalConfigurationButton"
    >
      <>
        <EuiSpacer size="s" />
        <EuiCompressedFormRow
          fullWidth={true}
          label={'Text field'}
          isInvalid={false}
          helpText={`The name of the text document field to be embedded`}
        >
          <EuiCompressedFieldText
            data-testid="textFieldQuickConfigure"
            fullWidth={true}
            value={optionalFieldValues?.textField || ''}
            onChange={(e) => {
              setOptionalFieldValues({
                ...optionalFieldValues,
                textField: e.target.value,
              });
            }}
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        {props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH && (
          <>
            <EuiCompressedFormRow
              fullWidth={true}
              label={'Image field'}
              isInvalid={false}
              helpText="The name of the document field containing the image binary."
            >
              <EuiCompressedFieldText
                fullWidth={true}
                value={optionalFieldValues?.imageField || ''}
                onChange={(e) => {
                  setOptionalFieldValues({
                    ...optionalFieldValues,
                    imageField: e.target.value,
                  });
                }}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
          </>
        )}
        {isVectorSearchUseCase(props.workflowType) && (
          <>
            <EuiCompressedFormRow
              fullWidth={true}
              label={props.workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS
                ? 'Sparse vector field'
                : 'Vector field'}
              isInvalid={false}
              helpText="The name of the document field containing the vector embedding."
            >
              <EuiCompressedFieldText
                fullWidth={true}
                value={optionalFieldValues?.vectorField || ''}
                onChange={(e) => {
                  setOptionalFieldValues({
                    ...optionalFieldValues,
                    vectorField: e.target.value,
                  });
                }}
              />
            </EuiCompressedFormRow>
            {unknownEmbeddingLength && props.workflowType !== WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS && (
              <>
                <EuiSpacer size="s" />
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Embedding length'}
                  isInvalid={false}
                  helpText="The length / dimension of the generated vector embeddings."
                >
                  <EuiCompressedFieldNumber
                    fullWidth={true}
                    value={props.fields?.embeddingLength || ''}
                    onChange={(e) => {
                      setOptionalFieldValues({
                        ...optionalFieldValues,
                        embeddingLength: Number(e.target.value),
                      });
                    }}
                  />
                </EuiCompressedFormRow>
              </>
            )}
          </>
        )}
        {isRAGUseCase(props.workflowType) && (
          <>
            <EuiCompressedFormRow
              fullWidth={true}
              label={'Prompt field'}
              isInvalid={false}
              helpText={'The model input field representing the prompt.'}
            >
              <EuiCompressedSuperSelect
                data-testid="selectPromptField"
                fullWidth={true}
                options={parseModelInputs(selectedLLMInterface).map(
                  (option) =>
                    ({
                      value: option.label,
                      inputDisplay: (
                        <>
                          <EuiText size="s">{option.label}</EuiText>
                        </>
                      ),
                      dropdownDisplay: (
                        <>
                          <EuiText size="s">{option.label}</EuiText>
                          <EuiText size="xs" color="subdued">
                            {option.type}
                          </EuiText>
                        </>
                      ),
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={optionalFieldValues?.promptField || ''}
                onChange={(option: string) => {
                  setOptionalFieldValues({
                    ...optionalFieldValues,
                    promptField: option,
                  });
                }}
                isInvalid={false}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              fullWidth={true}
              label={'LLM response field'}
              isInvalid={false}
              helpText="The name of the field containing the large language model (LLM) response."
            >
              <EuiCompressedFieldText
                fullWidth={true}
                value={optionalFieldValues?.llmResponseField || ''}
                onChange={(e) => {
                  setOptionalFieldValues({
                    ...optionalFieldValues,
                    llmResponseField: e.target.value,
                  });
                }}
              />
            </EuiCompressedFormRow>
          </>
        )}
      </>
    </EuiAccordion>
  );
}
