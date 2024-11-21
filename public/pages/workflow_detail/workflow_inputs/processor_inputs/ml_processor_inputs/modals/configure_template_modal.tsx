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
  EuiSpacer,
  EuiText,
  EuiPopover,
  EuiContextMenu,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  MAX_TEMPLATE_STRING_LENGTH,
  ModelInterface,
  PROMPT_PRESETS,
  PromptPreset,
  TemplateFormValues,
  TemplateSchema,
  WorkflowFormValues,
} from '../../../../../../../common';
import { getInitialValue } from '../../../../../../utils';
import { isEmpty } from 'lodash';

interface ConfigureTemplateModalProps {
  fieldPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

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
    template: getInitialValue('string'),
  } as TemplateFormValues;
  const templateFormSchema = yup.object({
    template: yup
      .string()
      .trim()
      .min(1, 'Too short')
      .max(MAX_TEMPLATE_STRING_LENGTH, 'Too long')
      .required('Required') as yup.Schema,
  }) as TemplateSchema;

  // persist standalone values. update / initialize when it is first opened
  const [tempTemplate, setTempTemplate] = useState<string>('');
  const [tempErrors, setTempErrors] = useState<boolean>(false);

  // button updating state
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // popover states
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  // if updating, take the temp var and assign it to the parent form
  function onUpdate() {
    setIsUpdating(true);
    setFieldValue(props.fieldPath, tempTemplate);
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
        // override to parent form value when changes detected
        useEffect(() => {
          formikProps.setFieldValue('template', getIn(values, props.fieldPath));
        }, [getIn(values, 'ingest.docs')]);

        // update tempTemplate when form changes are detected
        useEffect(() => {
          setTempTemplate(getIn(formikProps.values, 'template'));
        }, [getIn(formikProps.values, 'template')]);

        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Configure template`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody style={{ height: '40vh' }}>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <>
                    <EuiSpacer size="s" />
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
                                      'template',
                                      preset.prompt
                                    );
                                  } catch {}
                                  formikProps.setFieldTouched('template', true);
                                  setPresetsPopoverOpen(false);
                                },
                              })
                            ),
                          },
                        ]}
                      />
                    </EuiPopover>
                    <EuiSpacer size="m" />
                    <EuiText size="s">Prompt</EuiText>
                    <EuiSpacer size="s" />
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
                        formikProps.setFieldValue('template', value)
                      }
                      onBlur={(e) => {
                        formikProps.setFieldTouched('template');
                      }}
                    />
                  </>
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
                onClick={() => onUpdate()}
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
