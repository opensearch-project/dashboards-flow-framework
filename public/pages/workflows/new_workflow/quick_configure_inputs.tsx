/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';
import {
  EuiCompressedFormRow,
  EuiText,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiAccordion,
  EuiCompressedFieldText,
  EuiCompressedFieldNumber,
  EuiCallOut,
  EuiLink,
} from '@elastic/eui';
import {
  DEFAULT_IMAGE_FIELD,
  DEFAULT_LLM_RESPONSE_FIELD,
  DEFAULT_TEXT_FIELD,
  DEFAULT_VECTOR_FIELD,
  ML_CHOOSE_MODEL_LINK,
  ML_REMOTE_MODEL_LINK,
  MODEL_STATE,
  Model,
  ModelInterface,
  QuickConfigureFields,
  WORKFLOW_TYPE,
} from '../../../../common';
import { AppState } from '../../../store';
import { getEmbeddingModelDimensions, parseModelInputs } from '../../../utils';

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

  // Selected LLM interface state. Used for exposing a dropdown
  // of available model inputs to select from.
  const [selectedLLMInterface, setSelectedLLMInterface] = useState<
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

  // Advanced config accordion state
  const [accordionState, setAccordionState] = useState<'open' | 'closed'>(
    'closed'
  );

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
      case WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG: {
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
    setFieldValues(defaultFieldValues);
  }, [deployedModels]);

  // Hook to update the parent field values
  useEffect(() => {
    props.setFields(fieldValues);
  }, [fieldValues]);

  // Try to pre-fill the dimensions based on the chosen embedding model
  // If not found, we display a helper callout, and automatically
  // open the accordion to guide the user.
  const [unknownEmbeddingLength, setUnknownEmbeddingLength] = useState<boolean>(
    false
  );
  useEffect(() => {
    const selectedModel = deployedModels.find(
      (model) => model.id === fieldValues.embeddingModelId
    );
    if (selectedModel?.connectorId !== undefined) {
      const connector = connectors[selectedModel.connectorId];
      if (connector !== undefined) {
        const dimensions = getEmbeddingModelDimensions(connector);
        if (dimensions === undefined) {
          setUnknownEmbeddingLength(true);
          setAccordionState('open');
        }
        setUnknownEmbeddingLength(dimensions === undefined);
        setFieldValues({
          ...fieldValues,
          embeddingLength: getEmbeddingModelDimensions(connector),
        });
      }
    }
  }, [fieldValues.embeddingModelId, deployedModels, connectors]);

  // Set the LLM interface if an LLM is defined
  useEffect(() => {
    const selectedModel = deployedModels.find(
      (model) => model.id === fieldValues.llmId
    );
    setSelectedLLMInterface(selectedModel?.interface);
  }, [fieldValues.llmId, deployedModels, connectors]);

  // If an LLM interface is defined, set a default prompt field, if applicable.
  useEffect(() => {
    if (
      (props.workflowType === WORKFLOW_TYPE.RAG ||
        props.workflowType === WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG) &&
      selectedLLMInterface !== undefined
    ) {
      setFieldValues({
        ...fieldValues,
        promptField: get(parseModelInputs(selectedLLMInterface), '0.label'),
      });
    }
  }, [selectedLLMInterface]);

  return (
    <>
      {props.workflowType !== WORKFLOW_TYPE.CUSTOM ? (
        // Always include some model selection. For anything other than the vanilla RAG type,
        // we will always have a selectable embedding model.
        <>
          <EuiSpacer size="m" />
          {unknownEmbeddingLength && (
            <>
              <EuiCallOut
                size="s"
                title="No embedding length found. Make sure to manually configure below."
                color="warning"
              />
              <EuiSpacer size="s" />
            </>
          )}
          <EuiCompressedFormRow
            fullWidth={true}
            label={
              props.workflowType === WORKFLOW_TYPE.RAG
                ? 'Large language model'
                : 'Embedding model'
            }
            labelAppend={
              // TODO: update to be a popover with more content.
              <EuiText size="xs">
                <EuiLink href={ML_CHOOSE_MODEL_LINK} target="_blank">
                  Learn more
                </EuiLink>
              </EuiText>
            }
            isInvalid={false}
            helpText={
              isEmpty(deployedModels)
                ? undefined
                : props.workflowType === WORKFLOW_TYPE.RAG
                ? 'The large language model to generate user-friendly responses.'
                : 'The model to generate embeddings.'
            }
          >
            {isEmpty(deployedModels) ? (
              <EuiCallOut
                color="primary"
                size="s"
                title={
                  <EuiText size="s">
                    You have no models registered in your cluster.{' '}
                    <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                      Learn more
                    </EuiLink>{' '}
                    about integrating ML models.
                  </EuiText>
                }
              />
            ) : (
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
                valueOfSelected={
                  props.workflowType === WORKFLOW_TYPE.RAG
                    ? fieldValues?.llmId
                    : fieldValues?.embeddingModelId || ''
                }
                onChange={(option: string) => {
                  if (props.workflowType === WORKFLOW_TYPE.RAG) {
                    setFieldValues({
                      ...fieldValues,
                      llmId: option,
                    });
                  } else {
                    setFieldValues({
                      ...fieldValues,
                      embeddingModelId: option,
                    });
                  }
                }}
                isInvalid={false}
              />
            )}
          </EuiCompressedFormRow>
          <EuiSpacer size="s" />
          {
            // For vector search + RAG, include the LLM model selection as well
            props.workflowType === WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG && (
              <>
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Large language model'}
                  labelAppend={
                    // TODO: update to be a popover with more content.
                    <EuiText size="xs">
                      <EuiLink href={ML_CHOOSE_MODEL_LINK} target="_blank">
                        Learn more
                      </EuiLink>
                    </EuiText>
                  }
                  isInvalid={false}
                  helpText={
                    isEmpty(deployedModels)
                      ? undefined
                      : 'The large language model to generate user-friendly responses.'
                  }
                >
                  {isEmpty(deployedModels) ? (
                    <EuiCallOut
                      color="primary"
                      size="s"
                      title={
                        <EuiText size="s">
                          You have no models registered in your cluster.{' '}
                          <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                            Learn more
                          </EuiLink>{' '}
                          about integrating ML models.
                        </EuiText>
                      }
                    />
                  ) : (
                    <EuiCompressedSuperSelect
                      data-testid="selectDeployedModelLLM"
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
                      valueOfSelected={fieldValues?.llmId || ''}
                      onChange={(option: string) => {
                        setFieldValues({
                          ...fieldValues,
                          llmId: option,
                        });
                      }}
                      isInvalid={false}
                    />
                  )}
                </EuiCompressedFormRow>
                <EuiSpacer size="s" />
              </>
            )
          }
          <EuiSpacer size="s" />
          <EuiAccordion
            id="optionalConfiguration"
            buttonContent="Optional configuration"
            forceState={accordionState}
            data-testid="optionalConfigurationButton"
            onToggle={() =>
              accordionState === 'open'
                ? setAccordionState('closed')
                : setAccordionState('open')
            }
          >
            <>
              <EuiSpacer size="s" />
              <EuiCompressedFormRow
                fullWidth={true}
                label={'Text field'}
                isInvalid={false}
                helpText={`The name of the text document field to be ${
                  props.workflowType === WORKFLOW_TYPE.RAG
                    ? 'used as context to the large language model (LLM).'
                    : 'embedded.'
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
                    helpText="The name of the document field containing the image binary."
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
                props.workflowType === WORKFLOW_TYPE.HYBRID_SEARCH ||
                props.workflowType ===
                  WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG) && (
                <>
                  <EuiCompressedFormRow
                    fullWidth={true}
                    label={'Vector field'}
                    isInvalid={false}
                    helpText="The name of the document field containing the vector embedding."
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
              {(props.workflowType === WORKFLOW_TYPE.RAG ||
                props.workflowType ===
                  WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG) && (
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
                    helpText="The name of the field containing the large language model (LLM) response."
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
            </>
          </EuiAccordion>
        </>
      ) : undefined}
    </>
  );
}
