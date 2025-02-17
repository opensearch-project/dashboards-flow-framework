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
  EuiSmallButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
} from '@elastic/eui';
import {
  MODEL_STATE,
  WorkflowFormValues,
  ModelFormValue,
  ML_CHOOSE_MODEL_LINK,
  FETCH_ALL_QUERY_LARGE,
  UPDATE_MODEL_DOCS_LINK,
} from '../../../../../common';
import { AppState, searchModels, useAppDispatch } from '../../../../store';
import { getDataSourceId } from '../../../../utils';

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
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
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
              title={
                <EuiText size="s">
                  This model has no interface set up yet.{' '}
                  <EuiLink href={UPDATE_MODEL_DOCS_LINK} target="_blank">
                    Learn more
                  </EuiLink>{' '}
                  about updating a model. Refresh the list when you finish.
                </EuiText>
              }
              color="warning"
            />
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
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiFlexItem grow={true}>
                  <EuiCompressedSuperSelect
                    data-testid="selectDeployedModel"
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
                              <EuiHealth
                                color={
                                  isEmpty(option.interface)
                                    ? 'warning'
                                    : 'success'
                                }
                              >
                                <EuiText size="s">{option.name}</EuiText>
                              </EuiHealth>
                              <EuiText size="xs" color="subdued">
                                {isEmpty(option.interface)
                                  ? 'Not ready - no model interface'
                                  : 'Deployed'}
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
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonIcon
                    iconType={'refresh'}
                    aria-label="refresh"
                    display="base"
                    onClick={() => {
                      dispatch(
                        searchModels({
                          apiBody: FETCH_ALL_QUERY_LARGE,
                          dataSourceId,
                        })
                      );
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiCompressedFormRow>
          );
        }}
      </Field>
    </>
  );
}
