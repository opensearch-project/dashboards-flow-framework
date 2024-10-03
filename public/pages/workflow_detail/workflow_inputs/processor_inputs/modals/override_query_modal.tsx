/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
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
} from '@elastic/eui';
import {
  IMAGE_FIELD_PATTERN,
  IProcessorConfig,
  LABEL_FIELD_PATTERN,
  MapEntry,
  MODEL_ID_PATTERN,
  ModelInterface,
  QUERY_IMAGE_PATTERN,
  QUERY_PRESETS,
  QUERY_TEXT_PATTERN,
  QueryPreset,
  TEXT_FIELD_PATTERN,
  VECTOR_FIELD_PATTERN,
  VECTOR_PATTERN,
  WorkflowFormValues,
} from '../../../../../../common';
import { parseModelOutputs } from '../../../../../utils/utils';
import { JsonField } from '../../input_fields';

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

  // get some current form values
  const modelOutputs = parseModelOutputs(props.modelInterface);
  const queryFieldPath = `${props.baseConfigPath}.${props.config.id}.query_template`;
  const outputMap = getIn(
    values,
    `${props.baseConfigPath}.${props.config.id}.output_map`
  );
  // TODO: should handle edge case of multiple output maps configured. Currently
  // defaulting to prediction 0 / assuming not multiple predictions to track.
  const outputMapKeys = getIn(outputMap, '0', []).map(
    (mapEntry: MapEntry) => mapEntry.key
  ) as string[];
  const finalModelOutputs =
    outputMapKeys.length > 0
      ? outputMapKeys.map((outputMapKey) => {
          return { label: outputMapKey };
        })
      : modelOutputs.map((modelOutput) => {
          return { label: modelOutput.label };
        });

  // popover states
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Override query`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '40vh' }}>
        <EuiText color="subdued">
          Configure a custom query template to override the existing one.
          Optionally inject dynamic model outputs into the new query.
        </EuiText>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiSpacer size="s" />
              <EuiPopover
                button={
                  <EuiSmallButton
                    onClick={() => setPresetsPopoverOpen(!presetsPopoverOpen)}
                  >
                    Choose from a preset
                  </EuiSmallButton>
                }
                isOpen={presetsPopoverOpen}
                closePopover={() => setPresetsPopoverOpen(false)}
                anchorPosition="downLeft"
              >
                <EuiContextMenu
                  initialPanelId={0}
                  panels={[
                    {
                      id: 0,
                      items: QUERY_PRESETS.map((preset: QueryPreset) => ({
                        name: preset.name,
                        onClick: () => {
                          setFieldValue(
                            queryFieldPath,
                            preset.query
                              // sanitize the query preset string into valid template placeholder format, for
                              // any placeholder values in the query.
                              // for example, replacing `"{{vector}}"` with `${vector}`
                              .replace(
                                new RegExp(`"${VECTOR_FIELD_PATTERN}"`, 'g'),
                                `\$\{vector_field\}`
                              )
                              .replace(
                                new RegExp(`"${VECTOR_PATTERN}"`, 'g'),
                                `\$\{vector\}`
                              )
                              .replace(
                                new RegExp(`"${TEXT_FIELD_PATTERN}"`, 'g'),
                                `\$\{text_field\}`
                              )
                              .replace(
                                new RegExp(`"${IMAGE_FIELD_PATTERN}"`, 'g'),
                                `\$\{image_field\}`
                              )
                              .replace(
                                new RegExp(`"${LABEL_FIELD_PATTERN}"`, 'g'),
                                `\$\{label_field\}`
                              )
                              .replace(
                                new RegExp(`"${QUERY_TEXT_PATTERN}"`, 'g'),
                                `\$\{query_text\}`
                              )
                              .replace(
                                new RegExp(`"${QUERY_IMAGE_PATTERN}"`, 'g'),
                                `\$\{query_image\}`
                              )
                              .replace(
                                new RegExp(`"${MODEL_ID_PATTERN}"`, 'g'),
                                `\$\{model_id\}`
                              )
                          );
                          setFieldTouched(queryFieldPath, true);
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
                fieldPath={queryFieldPath}
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
                        To use any model outputs in the query template, copy the
                        placeholder string directly.
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
        <EuiSmallButton
          onClick={props.onClose}
          fill={false}
          color="primary"
          data-testid="closeModalButton"
        >
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
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
