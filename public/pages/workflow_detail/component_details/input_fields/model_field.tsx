/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, useFormikContext } from 'formik';
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
  IComponentField,
  MODEL_STATE,
  ROBERTA_SENTENCE_TRANSFORMER,
  WorkspaceFormValues,
  isFieldInvalid,
  ModelFormValue,
  MODEL_CATEGORY,
} from '../../../../../common';
import { AppState } from '../../../../store';

interface ModelFieldProps {
  field: IComponentField;
  componentId: string;
  onFormChange: () => void;
}

enum MODEL_TYPE {
  CUSTOM = 'Custom',
  PRETRAINED = 'Pretrained',
}

enum RADIO_ID {
  DEPLOYED = 'Deployed',
  PRETRAINED = 'Pretrained',
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

  const formField = `${props.componentId}.${props.field.id}`;
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
      },
      {
        id: BERT_SENTENCE_TRANSFORMER.name,
        name: BERT_SENTENCE_TRANSFORMER.shortenedName,
        category: MODEL_CATEGORY.PRETRAINED,
      },
    ];
    setPretrainedModels(modelItems);
  }, []);

  // Update the valid available models when the radio selection changes.
  // e.g., only show deployed models when 'deployed' button is selected
  useEffect(() => {
    if (selectedRadioId !== undefined) {
      if (selectedRadioId === MODEL_CATEGORY.DEPLOYED) {
        setSelectableModels(deployedModels);
      } else {
        setSelectableModels(pretrainedModels);
      }
    }
  }, [selectedRadioId, deployedModels, pretrainedModels]);

  return (
    <Field name={formField}>
      {({ field, form }: FieldProps) => {
        // a hook to update the model category and trigger reloading
        // of valid models to select from
        useEffect(() => {
          setSelectedRadioId(field.value.category);
        }, [field.value.category]);
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
                idSelected={field.value.category}
                onChange={(radioId) => {
                  // if user selects a new category:
                  // 1. clear the saved ID
                  // 2. update the field category
                  form.setFieldValue(formField, {
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
                      value: option.name,
                      inputDisplay: (
                        <>
                          <EuiText size="xs">{option.name}</EuiText>
                          <EuiText size="xs" color="subdued">
                            {option.category}
                          </EuiText>
                        </>
                      ),
                      disabled: false,
                    } as EuiSuperSelectOption<string>)
                )}
                valueOfSelected={field.value.id || ''}
                onChange={(option: string) => {
                  form.setFieldValue(formField, {
                    id: option,
                    category: selectedRadioId,
                  } as ModelFormValue);
                  props.onFormChange();
                }}
                isInvalid={isFieldInvalid(
                  props.componentId,
                  props.field.id,
                  errors,
                  touched
                )}
              />
            </>
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
