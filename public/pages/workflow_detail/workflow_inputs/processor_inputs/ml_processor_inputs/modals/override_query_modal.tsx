/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFormikContext, getIn, Formik } from 'formik';
import * as yup from 'yup';
import {
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
  EuiCode,
  EuiBasicTable,
  EuiAccordion,
  EuiCopy,
  EuiButtonIcon,
  EuiContextMenu,
  EuiSmallButtonEmpty,
} from '@elastic/eui';
import {
  IConfigField,
  IMAGE_FIELD_PATTERN,
  IProcessorConfig,
  LABEL_FIELD_PATTERN,
  MODEL_ID_PATTERN,
  ModelInterface,
  NO_TRANSFORMATION,
  OutputMapEntry,
  QUERY_IMAGE_PATTERN,
  QUERY_PRESETS,
  QUERY_TEXT_PATTERN,
  QueryPreset,
  RequestFormValues,
  TEXT_FIELD_PATTERN,
  TRANSFORM_TYPE,
  VECTOR_FIELD_PATTERN,
  VECTOR_PATTERN,
  WorkflowFormValues,
} from '../../../../../../../common';
import { parseModelOutputs } from '../../../../../../utils/utils';
import { JsonField } from '../../../input_fields';
import { getFieldSchema, getInitialValue } from '../../../../../../utils';
import '../../../../../../global-styles.scss';

interface OverrideQueryModalProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure a query template & override the existing query. Can manually configure,
 * include placeholder values using model outputs, and/or select from a presets library.
 */
export function OverrideQueryModal(props: OverrideQueryModalProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // sub-form values/schema
  const requestFormValues = {
    request: getInitialValue('json'),
  } as RequestFormValues;
  const requestFormSchema = yup.object({
    request: getFieldSchema({
      type: 'json',
    } as IConfigField),
  }) as yup.Schema;

  // persist standalone values. update / initialize when it is first opened
  const [tempRequest, setTempRequest] = useState<string>('{}');

  // get some current form values
  const modelOutputs = parseModelOutputs(props.modelInterface);
  const queryFieldPath = `${props.baseConfigPath}.${props.config.id}.query_template`;

  // compile all of the different output map values that can be injected into the query rewrite.
  // need special logic to process each transform type (e.g., transform type may add multiple outputs per entry)
  const outputMap = getIn(
    values,
    `${props.baseConfigPath}.${props.config.id}.output_map`
  );
  let outputMapNoTransformValues = [] as string[];
  let outputMapFieldValues = [] as string[];
  let outputMapExpressionValues = [] as string[];

  getIn(outputMap, '0', []).forEach((mapEntry: OutputMapEntry) => {
    // @ts-ignore
    if (mapEntry.value.transformType === NO_TRANSFORMATION) {
      outputMapNoTransformValues.push(mapEntry.key);
    } else if (mapEntry.value.transformType === TRANSFORM_TYPE.FIELD) {
      outputMapFieldValues.push(mapEntry.value?.value as string);
    } else {
      outputMapExpressionValues = [
        ...outputMapExpressionValues,
        ...(mapEntry.value.nestedVars
          ? mapEntry.value.nestedVars.map((nestedVar) => nestedVar.name)
          : []),
      ];
    }
  });
  const outputMapValues = [
    ...outputMapNoTransformValues,
    ...outputMapFieldValues,
    ...outputMapExpressionValues,
  ];
  const finalModelOutputs =
    outputMapValues.length > 0
      ? outputMapValues.map((outputMapValue) => {
          return { label: outputMapValue };
        })
      : modelOutputs.map((modelOutput) => {
          return { label: modelOutput.label };
        });

  // popover states
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  return (
    <Formik
      enableReinitialize={false}
      initialValues={requestFormValues}
      validationSchema={requestFormSchema}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // override to parent form value when changes detected
        useEffect(() => {
          formikProps.setFieldValue('request', getIn(values, queryFieldPath));
        }, [getIn(values, queryFieldPath)]);

        // update tempRequest when form changes are detected
        useEffect(() => {
          setTempRequest(getIn(formikProps.values, 'request'));
        }, [getIn(formikProps.values, 'request')]);

        return (
          <EuiModal
            maxWidth={false}
            onClose={props.onClose}
            className="configuration-modal"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Rewrite query`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody style={{ height: '40vh' }}>
              <EuiText color="subdued">
                Rewrite the existing query definition by defining a query
                template. You can also inject dynamic model inputs into the
                query template.
              </EuiText>
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
                            items: QUERY_PRESETS.map((preset: QueryPreset) => ({
                              name: preset.name,
                              onClick: () => {
                                formikProps.setFieldValue(
                                  'request',
                                  preset.query
                                    // sanitize the query preset string into valid template placeholder format, for
                                    // any placeholder values in the query.
                                    // for example, replacing `"{{vector}}"` with `${vector}`
                                    .replace(
                                      new RegExp(
                                        `"${VECTOR_FIELD_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{vector_field\}`
                                    )
                                    .replace(
                                      new RegExp(`"${VECTOR_PATTERN}"`, 'g'),
                                      `\$\{vector\}`
                                    )
                                    .replace(
                                      new RegExp(
                                        `"${TEXT_FIELD_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{text_field\}`
                                    )
                                    .replace(
                                      new RegExp(
                                        `"${IMAGE_FIELD_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{image_field\}`
                                    )
                                    .replace(
                                      new RegExp(
                                        `"${LABEL_FIELD_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{label_field\}`
                                    )
                                    .replace(
                                      new RegExp(
                                        `"${QUERY_TEXT_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{query_text\}`
                                    )
                                    .replace(
                                      new RegExp(
                                        `"${QUERY_IMAGE_PATTERN}"`,
                                        'g'
                                      ),
                                      `\$\{query_image\}`
                                    )
                                    .replace(
                                      new RegExp(`"${MODEL_ID_PATTERN}"`, 'g'),
                                      `\$\{model_id\}`
                                    )
                                );
                                formikProps.setFieldTouched('request', true);
                                setPresetsPopoverOpen(false);
                              },
                            })),
                          },
                        ]}
                      />
                    </EuiPopover>
                    <EuiSpacer size="m" />
                    <JsonField
                      validate={false}
                      label={'Query template'}
                      fieldPath={'request'}
                      editorHeight="30vh"
                    />
                    {finalModelOutputs.length > 0 && (
                      <>
                        <EuiSpacer size="m" />
                        <EuiAccordion
                          id={`modelOutputsAccordion`}
                          buttonContent="Model outputs"
                          style={{ marginLeft: '-8px' }}
                        >
                          <>
                            <EuiSpacer size="s" />
                            <EuiText
                              style={{ paddingLeft: '8px' }}
                              size="s"
                              color="subdued"
                            >
                              To use any model outputs in the query template,
                              copy the placeholder string directly.
                            </EuiText>
                            <EuiSpacer size="s" />
                            <EuiBasicTable
                              // @ts-ignore
                              items={finalModelOutputs}
                              columns={columns}
                            />
                          </>
                        </EuiAccordion>
                        <EuiSpacer size="m" />
                      </>
                    )}
                  </>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={props.onClose}
                color="primary"
                data-testid="cancelOverrideQueryButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                onClick={() => {
                  setFieldValue(queryFieldPath, tempRequest);
                  setFieldTouched(queryFieldPath, true);
                  props.onClose();
                }}
                isDisabled={false} // users can always save. we can't easily validate the JSON, as it can contain placeholders that isn't valid JSON.
                fill={true}
                color="primary"
                data-testid="updateOverrideQueryButton"
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

const columns = [
  {
    name: 'Name',
    field: 'label',
    width: '40%',
  },
  {
    name: 'Placeholder string',
    field: 'label',
    width: '50%',
    render: (label: string) => (
      <EuiCode
        style={{
          marginLeft: '-10px',
        }}
        language="json"
        transparentBackground={true}
      >
        {getPlaceholderString(label)}
      </EuiCode>
    ),
  },
  {
    name: 'Actions',
    field: 'label',
    width: '10%',
    render: (label: string) => (
      <EuiCopy textToCopy={getPlaceholderString(label)}>
        {(copy) => (
          <EuiButtonIcon
            aria-label="Copy"
            iconType="copy"
            onClick={copy}
          ></EuiButtonIcon>
        )}
      </EuiCopy>
    ),
  },
];

// small util fn to get the full placeholder string to be
// inserted into the template
function getPlaceholderString(label: string) {
  return `\$\{${label}\}`;
}
