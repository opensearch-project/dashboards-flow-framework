/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import {
  EuiCallOut,
  EuiCompressedFormRow,
  EuiLink,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  MODEL_STATE,
  WorkspaceFormValues,
  ModelFormValue,
  IConfigField,
  ML_CHOOSE_MODEL_LINK,
} from '../../../../../common';
import { AppState } from '../../../../store';

interface ModelFieldProps {
  field: IConfigField;
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  hasModelInterface: boolean;
  onModelChange: (modelId: string) => void;
  onFormChange: () => void;
}

type ModelItem = ModelFormValue & {
  name: string;
  interface?: {};
};

/**
 * A specific field for selecting existing deployed models
 */
export function ModelField(props: ModelFieldProps) {
  // Initial store is fetched when loading base <DetectorDetail /> page. We don't
  // re-fetch here as it could overload client-side if user clicks back and forth /
  // keeps re-rendering this component (and subsequently re-fetching data) as they're building flows
  const models = useSelector((state: AppState) => state.models.models);

  const { errors, touched } = useFormikContext<WorkspaceFormValues>();

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<ModelItem[]>([]);

  // Hook to update available deployed models
  useEffect(() => {
    if (models) {
      const modelItems = [] as ModelItem[];
      Object.keys(models).forEach((modelId) => {
        if (models[modelId].state === MODEL_STATE.DEPLOYED) {
          modelItems.push({
            id: modelId,
            name: models[modelId].name,
            algorithm: models[modelId].algorithm,
            interface: models[modelId].interface,
          } as ModelItem);
        }
      });
      setDeployedModels(modelItems);
    }
  }, [models]);

  return (
    <>
      {!props.hasModelInterface && (
        <>
          <EuiCallOut
            size="s"
            title="The selected model does not have a model interface. Cannot automatically determine model inputs and outputs."
            iconType={'alert'}
            color="warning"
          />
          <EuiSpacer size="s" />
        </>
      )}
      <Field name={props.fieldPath}>
        {({ field, form }: FieldProps) => {
          return (
            <EuiCompressedFormRow
              label={'Model'}
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={ML_CHOOSE_MODEL_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              }
              helpText={'The model ID.'}
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
                valueOfSelected={field.value?.id || ''}
                onChange={(option: string) => {
                  form.setFieldTouched(props.fieldPath, true);
                  form.setFieldValue(props.fieldPath, {
                    id: option,
                  } as ModelFormValue);
                  props.onFormChange();
                  props.onModelChange(option);
                }}
                isInvalid={
                  getIn(errors, field.name) && getIn(touched, field.name)
                    ? true
                    : undefined
                }
              />
            </EuiCompressedFormRow>
          );
        }}
      </Field>
    </>
  );
}
