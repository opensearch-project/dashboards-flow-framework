/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext, getIn, Formik } from 'formik';
import * as yup from 'yup';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSmallButton,
  EuiText,
  EuiPopover,
  EuiContextMenu,
  EuiSmallButtonEmpty,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiCopy,
} from '@elastic/eui';
import {
  MAX_STRING_LENGTH,
  MAX_TEMPLATE_STRING_LENGTH,
  ModelInterface,
  PROMPT_PRESETS,
  PromptPreset,
  TemplateFormValues,
  TemplateSchema,
  TemplateVar,
  WorkflowFormValues,
} from '../../../../../../../common';
import { getInitialValue } from '../../../../../../utils';
import { isEmpty } from 'lodash';
import { TextField } from '../../../input_fields';

interface ConfigureTemplateModalProps {
  fieldPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

// Spacing between the input field columns
const KEY_FLEX_RATIO = 4;
const VALUE_FLEX_RATIO = 6;

/**
 * A modal to configure a prompt template. Can manually configure, include placeholder values
 * using other model inputs, and/or select from a presets library.
 */
export function ConfigureTemplateModal(props: ConfigureTemplateModalProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const templateFormValues = {
    value: getInitialValue('string'),
    nestedVars: [],
  } as TemplateFormValues;
  const templateFormSchema = yup.object({
    value: yup
      .string()
      .trim()
      .min(1, 'Too short')
      .max(MAX_TEMPLATE_STRING_LENGTH, 'Too long')
      .required('Required') as yup.Schema,
    nestedVars: yup.array().of(
      yup.object().shape({
        name: yup
          .string()
          .trim()
          .min(1, 'Too short')
          .max(MAX_STRING_LENGTH, 'Too long')
          .required('Required') as yup.Schema,
        transform: yup
          .string()
          .trim()
          .min(1, 'Too short')
          .max(MAX_STRING_LENGTH, 'Too long')
          .required('Required') as yup.Schema,
      })
    ) as yup.Schema,
  }) as TemplateSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempTemplate, setTempTemplate] = useState<string>('');
  const [tempNestedVars, setTempNestedVars] = useState<TemplateVar[]>([]);
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // button updating state
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // popover states
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  // if updating, take the temp vars and assign it to the parent form
  function onUpdate() {
    setIsUpdating(true);
    setFieldValue(`${props.fieldPath}.value`, tempTemplate);
    setFieldValue(`${props.fieldPath}.nestedVars`, tempNestedVars);
    setFieldTouched(props.fieldPath, true);
    props.onClose();
  }

  return (
    <Formik
      enableReinitialize={false}
      initialValues={templateFormValues}
      validationSchema={templateFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form values when changes detected
        useEffect(() => {
          formikProps.setFieldValue(
            'value',
            getIn(values, `${props.fieldPath}.value`)
          );
          formikProps.setFieldValue(
            'nestedVars',
            getIn(values, `${props.fieldPath}.nestedVars`)
          );
        }, [getIn(values, props.fieldPath)]);

        // update temp vars when form changes are detected
        useEffect(() => {
          setTempTemplate(getIn(formikProps.values, 'value'));
        }, [getIn(formikProps.values, 'value')]);
        useEffect(() => {
          setTempNestedVars(getIn(formikProps.values, 'nestedVars'));
        }, [getIn(formikProps.values, 'nestedVars')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        // Adding an input var to the end of the existing arr
        function addInputVar(curInputVars: TemplateVar[]): void {
          const updatedInputVars = [
            ...curInputVars,
            { name: '', transform: '' } as TemplateVar,
          ];
          formikProps.setFieldValue(`nestedVars`, updatedInputVars);
          formikProps.setFieldTouched(`nestedVars`, true);
        }

        // Deleting an input var
        function deleteInputVar(
          curInputVars: TemplateVar[],
          idxToDelete: number
        ): void {
          const updatedInputVars = [...curInputVars];
          updatedInputVars.splice(idxToDelete, 1);
          formikProps.setFieldValue('nestedVars', updatedInputVars);
          formikProps.setFieldTouched('nestedVars', true);
        }

        return (
          <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Configure template`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody style={{ height: '40vh' }}>
              <EuiFlexGroup direction="row">
                <EuiFlexItem grow={6}>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceAround"
                      >
                        <EuiFlexItem>
                          <EuiText size="m">Prompt</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiPopover
                            button={
                              <EuiSmallButton
                                onClick={() =>
                                  setPresetsPopoverOpen(!presetsPopoverOpen)
                                }
                                iconSide="right"
                                iconType="arrowDown"
                              >
                                Choose from a preset
                              </EuiSmallButton>
                            }
                            isOpen={presetsPopoverOpen}
                            closePopover={() => setPresetsPopoverOpen(false)}
                            anchorPosition="downLeft"
                          >
                            <EuiContextMenu
                              size="s"
                              initialPanelId={0}
                              panels={[
                                {
                                  id: 0,
                                  items: PROMPT_PRESETS.map(
                                    (preset: PromptPreset) => ({
                                      name: preset.name,
                                      onClick: () => {
                                        try {
                                          formikProps.setFieldValue(
                                            'value',
                                            preset.prompt
                                          );
                                        } catch {}
                                        formikProps.setFieldTouched(
                                          'value',
                                          true
                                        );
                                        setPresetsPopoverOpen(false);
                                      },
                                    })
                                  ),
                                },
                              ]}
                            />
                          </EuiPopover>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCodeEditor
                        mode="json"
                        theme="textmate"
                        width="100%"
                        height="15vh"
                        value={tempTemplate}
                        readOnly={false}
                        setOptions={{
                          fontSize: '12px',
                          autoScrollEditorIntoView: true,
                          showLineNumbers: false,
                          showGutter: false,
                          showPrintMargin: false,
                          wrap: true,
                        }}
                        tabSize={2}
                        onChange={(value) =>
                          formikProps.setFieldValue('value', value)
                        }
                        onBlur={(e) => {
                          formikProps.setFieldTouched('value');
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="m">Input variables</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceAround"
                      >
                        <EuiFlexItem grow={KEY_FLEX_RATIO}>
                          <EuiText size="s" color="subdued">
                            {`Name`}
                          </EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                          <EuiText size="s" color="subdued">
                            {`Expression`}
                          </EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="s" />
                      {formikProps.values.nestedVars?.map(
                        (templateVar, idx) => {
                          return (
                            <div key={idx}>
                              <EuiFlexGroup
                                key={idx}
                                direction="row"
                                justifyContent="spaceAround"
                                gutterSize="s"
                              >
                                <EuiFlexItem grow={KEY_FLEX_RATIO}>
                                  <TextField
                                    fullWidth={true}
                                    fieldPath={`nestedVars.${idx}.name`}
                                    placeholder={`Name`}
                                    showError={true}
                                  />
                                </EuiFlexItem>
                                <EuiFlexItem grow={VALUE_FLEX_RATIO}>
                                  <EuiFlexGroup
                                    direction="row"
                                    justifyContent="spaceAround"
                                    gutterSize="xs"
                                  >
                                    <EuiFlexItem>
                                      <TextField
                                        fullWidth={true}
                                        fieldPath={`nestedVars.${idx}.transform`}
                                        placeholder={`Transform`}
                                        showError={true}
                                      />
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                      <EuiCopy
                                        textToCopy={getPlaceholderString(
                                          getIn(
                                            formikProps.values,
                                            `nestedVars.${idx}.transform`
                                          )
                                        )}
                                      >
                                        {(copy) => (
                                          <EuiSmallButtonIcon
                                            aria-label="Copy"
                                            iconType="copy"
                                            disabled={isEmpty(
                                              getIn(
                                                formikProps.values,
                                                `nestedVars.${idx}.transform`
                                              )
                                            )}
                                            color={
                                              isEmpty(
                                                getIn(
                                                  formikProps.values,
                                                  `nestedVars.${idx}.transform`
                                                )
                                              )
                                                ? 'subdued'
                                                : 'primary'
                                            }
                                            onClick={copy}
                                          />
                                        )}
                                      </EuiCopy>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                      <EuiSmallButtonIcon
                                        iconType={'trash'}
                                        color="danger"
                                        aria-label="Delete"
                                        onClick={() => {
                                          deleteInputVar(
                                            formikProps.values.nestedVars || [],
                                            idx
                                          );
                                        }}
                                      />
                                    </EuiFlexItem>
                                  </EuiFlexGroup>
                                </EuiFlexItem>
                              </EuiFlexGroup>
                              <EuiSpacer size="s" />
                            </div>
                          );
                        }
                      )}
                      <EuiSmallButtonEmpty
                        style={{
                          marginLeft: '-8px',
                          width: '125px',
                        }}
                        iconType={'plusInCircle'}
                        iconSide="left"
                        onClick={() => {
                          addInputVar(formikProps.values.nestedVars || []);
                        }}
                      >
                        {`Add variable`}
                      </EuiSmallButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={4}>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem>
                      <EuiFlexGroup
                        direction="row"
                        justifyContent="spaceAround"
                      >
                        <EuiFlexItem>
                          <EuiText size="m">Prompt preview</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiSmallButton
                            onClick={() =>
                              // TODO
                              console.log('executing preview...')
                            }
                          >
                            Run preview
                          </EuiSmallButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiText>TODO add transform here</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={props.onClose}
                color="primary"
                data-testid="closeTemplateButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  formikProps
                    .submitForm()
                    .then((value: any) => {
                      onUpdate();
                    })
                    .catch((err: any) => {});
                }}
                isLoading={isUpdating}
                isDisabled={tempErrors} // blocking update until valid input is given
                fill={true}
                color="primary"
                data-testid="updateTemplateButton"
              >
                Save
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}

// small util fn to get the full placeholder string to be
// inserted into the template. String conversion is required
// if the input is an array, for example. Also, all values
// should be prepended with "parameters.", as all inputs
// will be nested under a base parameters obj.
function getPlaceholderString(label: string, type?: string) {
  return type === 'array'
    ? `\$\{parameters.${label}.toString()\}`
    : `\$\{parameters.${label}\}`;
}
