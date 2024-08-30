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
  COHERE_DIMENSIONS,
  MODEL_STATE,
  Model,
  OPENAI_DIMENSIONS,
  QuickConfigureFields,
  WORKFLOW_TYPE,
} from '../../../../common';
import { AppState } from '../../../store';

interface QuickConfigureInputsProps {
  workflowType?: WORKFLOW_TYPE;
  setFields(fields: QuickConfigureFields): void;
}

const DEFAULT_TEXT_FIELD = 'my_text';
const DEFAULT_VECTOR_FIELD = 'my_embedding';
const DEFAULT_IMAGE_FIELD = 'my_image';

// Dynamic component to allow optional input configuration fields for different use cases.
// Hooks back to the parent component with such field values
export function QuickConfigureInputs(props: QuickConfigureInputsProps) {
  const { models, connectors } = useSelector((state: AppState) => state.ml);

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<Model[]>([]);

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
    if (
      props.workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH ||
      props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH ||
      props.workflowType === WORKFLOW_TYPE.HYBRID_SEARCH
    ) {
      defaultFieldValues = {
        textField: DEFAULT_TEXT_FIELD,
        vectorField: DEFAULT_VECTOR_FIELD,
      };
    }
    if (props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH) {
      defaultFieldValues = {
        ...defaultFieldValues,
        imageField: DEFAULT_IMAGE_FIELD,
      };
    }
    if (deployedModels.length > 0) {
      defaultFieldValues = {
        ...defaultFieldValues,
        embeddingModelId: deployedModels[0].id,
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
      (model) => model.id === fieldValues.embeddingModelId
    );
    if (selectedModel?.connectorId !== undefined) {
      const connector = connectors[selectedModel.connectorId];
      if (connector !== undefined) {
        // some APIs allow specifically setting the dimensions at runtime,
        // so we check for that first.
        if (connector.parameters?.dimensions !== undefined) {
          setFieldValues({
            ...fieldValues,
            embeddingLength: connector.parameters?.dimensions,
          });
        } else if (connector.parameters?.model !== undefined) {
          const dimensions =
            // @ts-ignore
            COHERE_DIMENSIONS[connector.parameters?.model] ||
            // @ts-ignore
            (OPENAI_DIMENSIONS[connector.parameters?.model] as
              | number
              | undefined);
          if (dimensions !== undefined) {
            setFieldValues({
              ...fieldValues,
              embeddingLength: dimensions,
            });
          }
        } else {
          setFieldValues({
            ...fieldValues,
            embeddingLength: undefined,
          });
        }
      }
    }
  }, [fieldValues.embeddingModelId, deployedModels, connectors]);

  return (
    <>
      {(props.workflowType === WORKFLOW_TYPE.SEMANTIC_SEARCH ||
        props.workflowType === WORKFLOW_TYPE.MULTIMODAL_SEARCH ||
        props.workflowType === WORKFLOW_TYPE.HYBRID_SEARCH) && (
        <>
          <EuiSpacer size="m" />
          <EuiAccordion
            id="optionalConfiguration"
            buttonContent="Optional configuration"
            initialIsOpen={false}
          >
            <EuiSpacer size="m" />
            <EuiCompressedFormRow
              label={'Embedding model'}
              isInvalid={false}
              helpText="The model to generate embeddings"
            >
              <EuiCompressedSuperSelect
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
                valueOfSelected={fieldValues?.embeddingModelId || ''}
                onChange={(option: string) => {
                  setFieldValues({
                    ...fieldValues,
                    embeddingModelId: option,
                  });
                }}
                isInvalid={false}
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow
              label={'Text field'}
              isInvalid={false}
              helpText="The name of the text document field to be embedded"
            >
              <EuiCompressedFieldText
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
                  label={'Image field'}
                  isInvalid={false}
                  helpText="The name of the document field containing the image binary"
                >
                  <EuiCompressedFieldText
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
            <EuiCompressedFormRow
              label={'Vector field'}
              isInvalid={false}
              helpText="The name of the document field containing the vector embedding"
            >
              <EuiCompressedFieldText
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
              label={'Embedding length'}
              isInvalid={false}
              helpText="The length / dimension of the generated vector embeddings. Autofilled values may be inaccurate."
            >
              <EuiCompressedFieldNumber
                value={fieldValues?.embeddingLength || ''}
                onChange={(e) => {
                  setFieldValues({
                    ...fieldValues,
                    embeddingLength: Number(e.target.value),
                  });
                }}
              />
            </EuiCompressedFormRow>
          </EuiAccordion>
        </>
      )}
    </>
  );
}
