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
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui';
import {
  MODEL_STATE,
  WorkspaceFormValues,
  ModelFormValue,
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
          } as ModelItem);
        }
      });
      setDeployedModels(modelItems);
    }
  }, [models]);

  return (
    <Field name={props.fieldPath}>
      {({ field, form }: FieldProps) => {
        return (
          <EuiFormRow
            label={'Model'}
            labelAppend={
              <EuiText size="xs">
                <EuiLink
                  href={
                    'https://opensearch.org/docs/latest/ml-commons-plugin/integrating-ml-models/#choosing-a-model'
                  }
                  target="_blank"
                >
                  Learn more
                </EuiLink>
              </EuiText>
            }
            helpText={'The model ID.'}
          >
            <EuiSuperSelect
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
                form.setFieldValue(props.fieldPath, {
                  id: option,
                } as ModelFormValue);
                props.onFormChange();
              }}
              isInvalid={
                getIn(errors, field.name) && getIn(touched, field.name)
                  ? true
                  : undefined
              }
            />
          </EuiFormRow>
        );
      }}
    </Field>
  );
}
