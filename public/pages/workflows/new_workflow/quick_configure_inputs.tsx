/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
} from '../../../../common';
import { AppState } from '../../../store';
import { getEmbeddingModelDimensions, parseModelInputs } from '../../../utils';
import { get } from 'lodash';

interface QuickConfigureInputsProps {
  workflowType?: WORKFLOW_TYPE;
  setFields(fields: QuickConfigureFields): void;
}

// Dynamic component to allow optional input configuration fields for different use cases.
// Hooks back to the parent component with such field values
export function QuickConfigureInputs(props: QuickConfigureInputsProps) {
  const { models, connectors } = useSelector((state: AppState) => state.ml);

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<Model[]>([]);

  // Selected model interface state
  const [selectedModelInterface, setSelectedModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // Hook to update available deployed models
  useEffect(() => {
    if (models) {
      setDeployedModels(
        Object.values(models).filter(
          (model) => model.state === MODEL_STATE.DEPLOYED
        )
      );
    }
  }, [models]);

  // Local field values state
  const [fieldValues, setFieldValues] = useState<QuickConfigureFields>({});

  // on initial load, and when there are any deployed models found, set
  // defaults for the field values for certain workflow types
  useEffect(() => {
    let defaultFieldValues = {} as QuickConfigureFields;
    switch (props.workflowType) {
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
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
      case WORKFLOW_TYPE.RAG: {
        defaultFieldValues = {
          textField: DEFAULT_TEXT_FIELD,
          promptField: '',
          llmResponseField: DEFAULT_LLM_RESPONSE_FIELD,
        };
        break;
      }
      case WORKFLOW_TYPE.CUSTOM:
      default:
        break;
    }
    if (deployedModels.length > 0) {
      defaultFieldValues = {
        ...defaultFieldValues,
        modelId: deployedModels[0].id,
      };
    }
    setFieldValues(defaultFieldValues);
  }, [deployedModels]);

  // Hook to update the parent field values
  useEffect(() => {
    props.setFields(fieldValues);
  }, [fieldValues]);

  // Try to pre-fill the dimensions based on the chosen model
  useEffect(() => {
    const selectedModel = deployedModels.find(
      (model) => model.id === fieldValues.modelId
    );
    setSelectedModelInterface(selectedModel?.interface);
    if (selectedModel?.connectorId !== undefined) {
      const connector = connectors[selectedModel.connectorId];
      if (connector !== undefined) {
        setFieldValues({
          ...fieldValues,
          embeddingLength: getEmbeddingModelDimensions(connector),
        });
      }
    }
  }, [fieldValues.modelId, deployedModels, connectors]);

  // When the model interface is defined, set a default prompt field, if applicable.
  useEffect(() => {
    if (
      props.workflowType === WORKFLOW_TYPE.RAG &&
      selectedModelInterface !== undefined
    ) {
      setFieldValues({
        ...fieldValues,
        promptField: get(parseModelInputs(selectedModelInterface), '0.label'),
      });
    }
  }, [selectedModelInterface]);

  return (
    <>
      {props.workflowType !== WORKFLOW_TYPE.CUSTOM ? (
        <>
          <EuiSpacer size="m" />
          <EuiAccordion
            id="optionalConfiguration"
            buttonContent="Optional configuration"
            initialIsOpen={false}
            data-testid="optionalConfigurationButton"
          >
            <EuiSpacer size="m" />
            <EuiCompressedFormRow
              fullWidth={true}
              label={
                props.workflowType === WORKFLOW_TYPE.RAG
                  ? 'Large language model'
                  : 'Embedding model'
              }
              isInvalid={false}
              helpText={
                props.workflowType === WORKFLOW_TYPE.RAG
                  ? 'The large language model to generate user-friendly responses'
                  : 'The model to generate embeddings'
              }
            >
              <EuiCompressedSuperSelect
                data-testid="selectDeployedModel"
                fullWidth={true}
                options={deployedModels.map(
                  (option) =>
                    ({
                      value: option.id,
                      inputDisplay: (
                        <>
                          <EuiText size="s">{option.name}</EuiText>
                        </>
                      ),
                      dropdownDisplay: (
                        <>
                          <EuiText size="s">{option.name}</EuiText>
                          <EuiText size="xs" color="subdued">
                            Deployed
                          </EuiText>
                          <EuiText size="xs" color="subdued">
                            {option.algorithm}
                          </EuiText>
                        </>
                      ),
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={fieldValues?.modelId || ''}
                onChange={(option: string) => {
                  setFieldValues({
                    ...fieldValues,
                    modelId: option,
                  });
                }}
                isInvalid={false}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              fullWidth={true}
              label={'Text field'}
              isInvalid={false}
              helpText={`The name of the text document field to be ${
                props.workflowType === WORKFLOW_TYPE.RAG
                  ? 'used as context to the large language model (LLM)'
                  : 'embedded'
              }`}
            >
              <EuiCompressedFieldText
                data-testid="textFieldQuickConfigure"
                fullWidth={true}
                value={fieldValues?.textField || ''}
                onChange={(e) => {
                  setFieldValues({
                    ...fieldValues,
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
                  helpText="The name of the document field containing the image binary"
                >
                  <EuiCompressedFieldText
                    fullWidth={true}
                    value={fieldValues?.imageField || ''}
                    onChange={(e) => {
                      setFieldValues({
                        ...fieldValues,
                        imageField: e.target.value,
                      });
                    }}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="s" />
              </>
            )}
            {(props.workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH ||
              props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH ||
              props.workflowType === WORKFLOW_TYPE.HYBRID_SEARCH) && (
              <>
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Vector field'}
                  isInvalid={false}
                  helpText="The name of the document field containing the vector embedding"
                >
                  <EuiCompressedFieldText
                    fullWidth={true}
                    value={fieldValues?.vectorField || ''}
                    onChange={(e) => {
                      setFieldValues({
                        ...fieldValues,
                        vectorField: e.target.value,
                      });
                    }}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="s" />
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Embedding length'}
                  isInvalid={false}
                  helpText="The length / dimension of the generated vector embeddings. Autofilled values may be inaccurate."
                >
                  <EuiCompressedFieldNumber
                    fullWidth={true}
                    value={fieldValues?.embeddingLength || ''}
                    onChange={(e) => {
                      setFieldValues({
                        ...fieldValues,
                        embeddingLength: Number(e.target.value),
                      });
                    }}
                  />
                </EuiCompressedFormRow>
              </>
            )}
            {props.workflowType === WORKFLOW_TYPE.RAG && (
              <>
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Prompt field'}
                  isInvalid={false}
                  helpText={'The model input field representing the prompt'}
                >
                  <EuiCompressedSuperSelect
                    data-testid="selectPromptField"
                    fullWidth={true}
                    options={parseModelInputs(selectedModelInterface).map(
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
                    valueOfSelected={fieldValues?.promptField || ''}
                    onChange={(option: string) => {
                      setFieldValues({
                        ...fieldValues,
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
                  helpText="The name of the field containing the large language model (LLM) response"
                >
                  <EuiCompressedFieldText
                    fullWidth={true}
                    value={fieldValues?.llmResponseField || ''}
                    onChange={(e) => {
                      setFieldValues({
                        ...fieldValues,
                        llmResponseField: e.target.value,
                      });
                    }}
                  />
                </EuiCompressedFormRow>
              </>
            )}
          </EuiAccordion>
        </>
      ) : undefined}
    </>
  );
}
