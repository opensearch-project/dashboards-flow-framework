/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiCompressedSelect,
  EuiSelectOption,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiPopover,
  EuiSmallButtonEmpty,
  EuiPopoverTitle,
  EuiCodeBlock,
  EuiCallOut,
  EuiCode,
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  ML_INFERENCE_RESPONSE_DOCS_LINK,
  MapArrayFormValue,
  ModelInterface,
  PROCESSOR_CONTEXT,
  SearchHit,
  SearchPipelineConfig,
  SimulateIngestPipelineResponse,
  WorkflowConfig,
  WorkflowFormValues,
  customStringify,
} from '../../../../../../common';
import {
  formikToPartialPipeline,
  generateTransform,
  prepareDocsForSimulate,
  unwrapTransformedDocs,
} from '../../../../../utils';
import {
  searchIndex,
  simulatePipeline,
  useAppDispatch,
} from '../../../../../store';
import { getCore } from '../../../../../services';
import { BooleanField, MapArrayField } from '../../input_fields';
import {
  getDataSourceId,
  parseModelInputs,
  parseModelInputsObj,
  parseModelOutputs,
  parseModelOutputsObj,
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
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();

  // get some current form values
  const modelConfigPath = `${props.baseConfigPath}.${props.config.id}.model_config`;
  const modelConfig = getIn(values, modelConfigPath) as string;
  const modelInputs = parseModelInputs(props.modelInterface);

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
              <EuiText color="subdued">
                Configure a custom prompt template. Optionally use model input
                values in the prompt template with placeholders.
              </EuiText>
              <EuiSpacer size="s" />
              <EuiText>Model inputs</EuiText>
              <EuiSpacer size="s" />
              {modelInputs.length > 0 ? (
                <>
                  <EuiCodeBlock language="json" fontSize="s" isCopyable={false}>
                    {customStringify({
                      parameters: parseModelInputsObj(props.modelInterface),
                    })}
                  </EuiCodeBlock>
                </>
              ) : (
                <EuiCallOut color="warning" title="No defined model inputs" />
              )}
              <EuiSpacer size="s" />
              {modelInputs.length > 0 && (
                <>
                  <EuiText>Model input placeholders</EuiText>
                  {modelInputs.map((modelInput) => {
                    return (
                      <EuiCode
                        language="json"
                        transparentBackground={true}
                      >{`parameters.${modelInput.label}`}</EuiCode>
                    );
                  })}
                  <EuiSpacer size="m" />
                </>
              )}
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
