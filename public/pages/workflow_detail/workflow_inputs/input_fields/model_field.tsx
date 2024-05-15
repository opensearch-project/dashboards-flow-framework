/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EuiFormRow,
  EuiLink,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiSpacer,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  BERT_SENTENCE_TRANSFORMER,
  MODEL_STATE,
  ROBERTA_SENTENCE_TRANSFORMER,
  WorkspaceFormValues,
  ModelFormValue,
  MODEL_CATEGORY,
  MPNET_SENTENCE_TRANSFORMER,
  NEURAL_SPARSE_TRANSFORMER,
  NEURAL_SPARSE_DOC_TRANSFORMER,
  NEURAL_SPARSE_TOKENIZER_TRANSFORMER,
  IConfigField,
} from '../../../../../common';
import { AppState } from '../../../../store';

interface ModelFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  onFormChange: () => void;
}

type ModelItem = ModelFormValue & {
  name: string;
};

// TODO: there is no concrete UX for model selection and model provisioning. This component is TBD
// and simply provides the ability to select existing models, or deploy some pretrained ones,
// and persist all of this in form state.
/**
 * A specific field for selecting existing deployed models, or available pretrained models.
 */
export function ModelField(props: ModelFieldProps) {
  // Initial store is fetched when loading base <DetectorDetail /> page. We don't
  // re-fetch here as it could overload client-side if user clicks back and forth /
  // keeps re-rendering this component (and subsequently re-fetching data) as they're building flows
  const models = useSelector((state: AppState) => state.models.models);

  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<ModelItem[]>([]);
  const [pretrainedModels, setPretrainedModels] = useState<ModelItem[]>([]);
  const [selectableModels, setSelectableModels] = useState<ModelItem[]>([]);

  // Radio options state
  const radioOptions = [
    {
      id: MODEL_CATEGORY.DEPLOYED,
      label: 'Existing deployed models',
    },
    {
      id: MODEL_CATEGORY.PRETRAINED,
      label: 'Pretrained models',
    },
  ] as EuiRadioGroupOption[];
  const [selectedRadioId, setSelectedRadioId] = useState<
    MODEL_CATEGORY | undefined
  >(undefined);

  // Initialize available deployed models
  useEffect(() => {
    if (models) {
      const modelItems = [] as ModelItem[];
      Object.keys(models).forEach((modelId) => {
        if (models[modelId].state === MODEL_STATE.DEPLOYED) {
          modelItems.push({
            id: modelId,
            name: models[modelId].name,
            category: MODEL_CATEGORY.DEPLOYED,
            algorithm: models[modelId].algorithm,
          } as ModelItem);
        }
      });
      setDeployedModels(modelItems);
    }
  }, [models]);

  // Initialize available pretrained models
  useEffect(() => {
    const modelItems = [
      {
        id: ROBERTA_SENTENCE_TRANSFORMER.name,
        name: ROBERTA_SENTENCE_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: ROBERTA_SENTENCE_TRANSFORMER.algorithm,
      },
      {
        id: MPNET_SENTENCE_TRANSFORMER.name,
        name: MPNET_SENTENCE_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: MPNET_SENTENCE_TRANSFORMER.algorithm,
      },
      {
        id: BERT_SENTENCE_TRANSFORMER.name,
        name: BERT_SENTENCE_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: BERT_SENTENCE_TRANSFORMER.algorithm,
      },
      {
        id: NEURAL_SPARSE_TRANSFORMER.name,
        name: NEURAL_SPARSE_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: NEURAL_SPARSE_TRANSFORMER.algorithm,
      },
      {
        id: NEURAL_SPARSE_DOC_TRANSFORMER.name,
        name: NEURAL_SPARSE_DOC_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: NEURAL_SPARSE_DOC_TRANSFORMER.algorithm,
      },
      {
        id: NEURAL_SPARSE_TOKENIZER_TRANSFORMER.name,
        name: NEURAL_SPARSE_TOKENIZER_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
        algorithm: NEURAL_SPARSE_TOKENIZER_TRANSFORMER.algorithm,
      },
    ];
    setPretrainedModels(modelItems);
  }, []);

  // Update the valid available models when the radio selection changes.
  // e.g., only show deployed models when 'deployed' button is selected
  useEffect(() => {
    if (selectedRadioId !== undefined) {
      // TODO: add fine-grained filtering so only relevant pretrained and existing models
      // are visible based on the use case
      if (selectedRadioId === MODEL_CATEGORY.DEPLOYED) {
        setSelectableModels(deployedModels);
      } else {
        setSelectableModels(pretrainedModels);
      }
    }
  }, [selectedRadioId, deployedModels, pretrainedModels]);

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        // a hook to update the model category and trigger reloading
        // of valid models to select from
        useEffect(() => {
          setSelectedRadioId(field.value?.category || MODEL_CATEGORY.DEPLOYED);
        }, [field.value?.category]);
        return (
          <EuiFormRow
            label={props.field.label}
            labelAppend={
              props.field.helpLink ? (
                <EuiText size="xs">
                  <EuiLink href={props.field.helpLink} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              ) : undefined
            }
            helpText={props.field.helpText || undefined}
          >
            <>
              <EuiRadioGroup
                options={radioOptions}
                idSelected={field.value?.category || MODEL_CATEGORY.DEPLOYED}
                onChange={(radioId) => {
                  // if user selects a new category:
                  // 1. clear the saved ID
                  // 2. update the field category
                  form.setFieldValue(props.fieldPath, {
                    id: '',
                    category: radioId,
                  } as ModelFormValue);
                  props.onFormChange();
                }}
              ></EuiRadioGroup>
              <EuiSpacer size="s" />
              <EuiSuperSelect
                options={selectableModels.map(
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
                            {option.category}
                          </EuiText>
                          <EuiText size="xs" color="subdued">
                            {option.algorithm}
                          </EuiText>
                        </>
                      ),
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={field.value?.id || ''}
                onChange={(option: string) => {
                  form.setFieldValue(props.fieldPath, {
                    id: option,
                    category: selectedRadioId,
                  } as ModelFormValue);
                  props.onFormChange();
                }}
                isInvalid={
                  getIn(errors, field.name) && getIn(touched, field.name)
                    ? true
                    : undefined
                }
              />
            </>
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
