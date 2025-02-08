/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiCallOut,
  EuiCompressedFormRow,
  EuiLink,
  EuiSpacer,
  EuiCompressedSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiSmallButton,
} from '@elastic/eui';
import {
  MODEL_STATE,
  WorkflowFormValues,
  ModelFormValue,
  ML_CHOOSE_MODEL_LINK,
  ML_REMOTE_MODEL_LINK,
} from '../../../../../common';
import { AppState } from '../../../../store';

interface ModelFieldProps {
  fieldPath: string; // the full path in string-form to the field (e.g., 'ingest.enrich.processors.text_embedding_processor.inputField')
  hasModelInterface?: boolean;
  onModelChange?: (modelId: string) => void;
  showMissingInterfaceCallout?: boolean;
  label?: string;
  helpText?: string;
  fullWidth?: boolean;
  showError?: boolean;
  showInvalid?: boolean;
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
  const models = useSelector((state: AppState) => state.ml.models);

  // Set defaults for optional props
  const showMissingInterfaceCallout = props.showMissingInterfaceCallout ?? true;
  const hasModelInterface = props.hasModelInterface ?? false;

  const { errors, touched, values } = useFormikContext<WorkflowFormValues>();

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
      {showMissingInterfaceCallout &&
        !hasModelInterface &&
        !isEmpty(getIn(values, props.fieldPath)?.id) && (
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
      {isEmpty(deployedModels) && (
        <>
          <EuiCallOut
            size="s"
            title="No deployed models found"
            iconType={'alert'}
            color="warning"
          >
            <EuiText size="s">
              To create and deploy models and make them accessible in
              OpenSearch, see documentation.
            </EuiText>
            <EuiSpacer size="s" />
            <EuiSmallButton
              target="_blank"
              href={ML_REMOTE_MODEL_LINK}
              iconSide="right"
              iconType={'popout'}
            >
              Documentation
            </EuiSmallButton>
          </EuiCallOut>
          <EuiSpacer size="s" />
        </>
      )}
      <Field name={props.fieldPath}>
        {({ field, form }: FieldProps) => {
          const isInvalid =
            (props.showInvalid ?? true) &&
            getIn(errors, `${field.name}.id`) &&
            getIn(touched, `${field.name}.id`);
          return (
            <EuiCompressedFormRow
              fullWidth={props.fullWidth}
              label={props.label || 'Model'}
              labelAppend={
                <EuiText size="xs">
                  <EuiLink href={ML_CHOOSE_MODEL_LINK} target="_blank">
                    Learn more
                  </EuiLink>
                </EuiText>
              }
              helpText={props.helpText || 'The model ID.'}
              isInvalid={isInvalid}
              error={props.showError && getIn(errors, `${field.name}.id`)}
            >
              <EuiCompressedSuperSelect
                fullWidth={props.fullWidth}
                disabled={isEmpty(deployedModels)}
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
                  if (props.onModelChange) {
                    props.onModelChange(option);
                  }
                }}
                isInvalid={isInvalid}
              />
            </EuiCompressedFormRow>
          );
        }}
      </Field>
    </>
  );
}
