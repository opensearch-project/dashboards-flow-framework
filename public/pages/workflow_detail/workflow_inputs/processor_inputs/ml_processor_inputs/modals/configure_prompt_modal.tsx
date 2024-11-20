/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn } from 'formik';
import { isEmpty } from 'lodash';
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
  EuiSmallButtonEmpty,
  EuiPopoverTitle,
  EuiCodeBlock,
  EuiCode,
  EuiBasicTable,
  EuiAccordion,
  EuiCopy,
  EuiButtonIcon,
  EuiContextMenu,
} from '@elastic/eui';
import {
  IProcessorConfig,
  ModelInputFormField,
  ModelInterface,
  PROMPT_FIELD,
  PROMPT_PRESETS,
  PromptPreset,
  WorkflowFormValues,
  customStringify,
} from '../../../../../../../common';
import {
  parseModelInputs,
  parseModelInputsObj,
} from '../../../../../../utils/utils';

interface ConfigurePromptModalProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure a prompt template. Can manually configure, include placeholder values
 * using other model inputs, and/or select from a presets library.
 */
export function ConfigurePromptModal(props: ConfigurePromptModalProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<
    WorkflowFormValues
  >();

  // get some current form values
  const modelConfigPath = `${props.baseConfigPath}.${props.config.id}.model_config`;
  const modelConfig = getIn(values, modelConfigPath) as string;
  const modelInputs = parseModelInputs(props.modelInterface);

  // popover states
  const [schemaPopoverOpen, setSchemaPopoverOpen] = useState<boolean>(false);
  const [presetsPopoverOpen, setPresetsPopoverOpen] = useState<boolean>(false);

  // prompt str state. manipulated as users manually update, or
  // from selecting a preset
  const [promptStr, setPromptStr] = useState<string>('');

  // hook to set the prompt if found in the model config
  useEffect(() => {
    try {
      const modelConfigObj = JSON.parse(getIn(values, modelConfigPath));
      const prompt = getIn(modelConfigObj, PROMPT_FIELD);
      if (!isEmpty(prompt)) {
        setPromptStr(prompt);
      } else {
        setPromptStr('');
      }
    } catch {}
  }, [getIn(values, modelConfigPath)]);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure prompt`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '40vh' }}>
        <EuiText color="subdued">
          Configure a custom prompt template for the model. Optionally inject
          dynamic model inputs into the template.
        </EuiText>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiSpacer size="s" />
              <EuiPopover
                button={
                  <EuiSmallButton
                    onClick={() => setPresetsPopoverOpen(!presetsPopoverOpen)}
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
                      items: PROMPT_PRESETS.map((preset: PromptPreset) => ({
                        name: preset.name,
                        onClick: () => {
                          try {
                            setFieldValue(
                              modelConfigPath,
                              customStringify({
                                ...JSON.parse(modelConfig),
                                [PROMPT_FIELD]: preset.prompt,
                              })
                            );
                          } catch {}
                          setFieldTouched(modelConfigPath, true);
                          setPresetsPopoverOpen(false);
                        },
                      })),
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
                value={promptStr}
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
                onChange={(value) => setPromptStr(value)}
                onBlur={(e) => {
                  let updatedModelConfig = {} as any;
                  try {
                    updatedModelConfig = JSON.parse(modelConfig);
                  } catch {}
                  if (isEmpty(promptStr)) {
                    // if the input is blank, it is assumed the user
                    // does not want any prompt. hence, remove the "prompt" field
                    // from the config altogether.
                    delete updatedModelConfig[PROMPT_FIELD];
                  } else {
                    updatedModelConfig[PROMPT_FIELD] = promptStr;
                  }
                  setFieldValue(
                    modelConfigPath,
                    customStringify(updatedModelConfig)
                  );
                  setFieldTouched(modelConfigPath);
                }}
              />
              {modelInputs.length > 0 && (
                <>
                  <EuiSpacer size="s" />
                  <EuiAccordion
                    id={`modelInputsAccordion`}
                    buttonContent="Model inputs"
                    style={{ marginLeft: '-8px' }}
                  >
                    <>
                      <EuiSpacer size="s" />
                      <EuiText
                        style={{ paddingLeft: '8px' }}
                        size="s"
                        color="subdued"
                      >
                        To use any model inputs in the prompt template, copy the
                        placeholder string directly.
                      </EuiText>
                      <EuiSpacer size="s" />
                      <EuiBasicTable items={modelInputs} columns={columns} />
                      <EuiSpacer size="s" />
                      <EuiPopover
                        isOpen={schemaPopoverOpen}
                        closePopover={() => setSchemaPopoverOpen(false)}
                        panelPaddingSize="s"
                        button={
                          <EuiSmallButtonEmpty
                            onClick={() =>
                              setSchemaPopoverOpen(!schemaPopoverOpen)
                            }
                          >
                            View input schema
                          </EuiSmallButtonEmpty>
                        }
                      >
                        <EuiPopoverTitle>
                          The JSON Schema defining the model's expected input
                        </EuiPopoverTitle>
                        <EuiCodeBlock
                          language="json"
                          fontSize="m"
                          isCopyable={false}
                        >
                          {customStringify(
                            parseModelInputsObj(props.modelInterface)
                          )}
                        </EuiCodeBlock>
                      </EuiPopover>
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
        <EuiSmallButton onClick={props.onClose} fill={false} color="primary">
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
    width: '25%',
  },
  {
    name: 'Type',
    field: 'type',
    width: '15%',
  },
  {
    name: 'Placeholder string',
    field: 'label',
    width: '50%',
    render: (label: string, modelInput: ModelInputFormField) => (
      <EuiCode
        style={{
          marginLeft: '-10px',
        }}
        language="json"
        transparentBackground={true}
      >
        {getPlaceholderString(modelInput.type, label)}
      </EuiCode>
    ),
  },
  {
    name: 'Actions',
    field: 'label',
    width: '10%',
    render: (label: string, modelInput: ModelInputFormField) => (
      <EuiCopy textToCopy={getPlaceholderString(modelInput.type, label)}>
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
// inserted into the template. String conversion is required
// if the input is an array, for example. Also, all values
// should be prepended with "parameters.", as all inputs
// will be nested under a base parameters obj.
function getPlaceholderString(type: string, label: string) {
  return type === 'array'
    ? `\$\{parameters.${label}.toString()\}`
    : `\$\{parameters.${label}\}`;
}
