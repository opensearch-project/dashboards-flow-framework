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
  EuiCallOut,
  EuiCode,
  EuiBasicTable,
  EuiAccordion,
} from '@elastic/eui';
import {
  IProcessorConfig,
  ModelInputFormField,
  ModelInterface,
  WorkflowFormValues,
  customStringify,
} from '../../../../../../common';
import {
  parseModelInputs,
  parseModelInputsObj,
} from '../../../../../utils/utils';

interface ConfigurePromptModalProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function ConfigurePromptModal(props: ConfigurePromptModalProps) {
  const { values } = useFormikContext<WorkflowFormValues>();

  // get some current form values
  const modelConfigPath = `${props.baseConfigPath}.${props.config.id}.model_config`;
  const modelConfig = getIn(values, modelConfigPath) as string;
  const modelInputs = parseModelInputs(props.modelInterface);

  // popover state containing the model interface details, if applicable
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // prompt state
  const [prompt, setPrompt] = useState<string>('');

  // hook to set the prompt if found in the model config
  useEffect(() => {
    const modelConfigString = getIn(
      values,
      `${props.baseConfigPath}.${props.config.id}.model_config`
    ) as string;
    try {
      const prompt = JSON.parse(modelConfigString)?.prompt;
      if (!isEmpty(prompt)) {
        setPrompt(prompt);
      } else {
        setPrompt('');
      }
    } catch {}
  }, [
    getIn(values, `${props.baseConfigPath}.${props.config.id}.model_config`),
  ]);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure prompt`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '40vh' }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiSpacer size="s" />
              {modelInputs.length > 0 ? (
                <>
                  <EuiAccordion
                    id={'todo'}
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
                        relevant placeholder string directly.
                      </EuiText>
                      <EuiSpacer size="s" />
                      <EuiBasicTable
                        items={modelInputs}
                        columns={[
                          {
                            name: 'Name',
                            field: 'label',
                            width: '30%',
                          },
                          {
                            name: 'Type',
                            field: 'type',
                            width: '15%',
                          },
                          {
                            name: 'Placeholder string',
                            field: 'label',
                            width: '55%',
                            render: (
                              label: string,
                              modelInput: ModelInputFormField
                            ) => (
                              <EuiCode
                                style={{
                                  marginLeft: '-10px',
                                }}
                                language="json"
                                transparentBackground={true}
                              >
                                {modelInput.type === 'array'
                                  ? `\$\{parameters.${label}.toString()\}`
                                  : `\$\\{parameters.${label}\\}`}
                              </EuiCode>
                            ),
                          },
                        ]}
                      />
                      <EuiSpacer size="s" />
                      <EuiPopover
                        isOpen={popoverOpen}
                        closePopover={() => setPopoverOpen(false)}
                        button={
                          <EuiSmallButtonEmpty
                            onClick={() => setPopoverOpen(!popoverOpen)}
                          >
                            View full input schema
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
                          {customStringify({
                            parameters: parseModelInputsObj(
                              props.modelInterface
                            ),
                          })}
                        </EuiCodeBlock>
                      </EuiPopover>
                    </>
                  </EuiAccordion>
                  <EuiSpacer size="m" />
                </>
              ) : (
                <EuiCallOut color="warning" title="No defined model inputs" />
              )}
              <EuiSpacer size="s" />
              <EuiText>Prompt</EuiText>
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="15vh"
                value={prompt}
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
                onChange={(value) => console.log('value now: ', value)}
              />
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
