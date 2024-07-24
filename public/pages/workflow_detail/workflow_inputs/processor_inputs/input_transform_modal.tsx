/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiButton,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  PROCESSOR_CONTEXT,
  SimulateIngestPipelineResponse,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import {
  formikToIngestPipeline,
  generateTransform,
  prepareDocsForSimulate,
  unwrapTransformedDocs,
} from '../../../../utils';
import { simulatePipeline, useAppDispatch } from '../../../../store';
import { getCore } from '../../../../services';
import { MapField } from '../input_fields';

interface InputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  inputMapField: IConfigField;
  inputMapFieldPath: string;
  onClose: () => void;
  onFormChange: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms into a model's expected input
 */
export function InputTransformModal(props: InputTransformModalProps) {
  const dispatch = useAppDispatch();
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('[]');

  // get the current input map
  const map = getIn(values, `ingest.enrich.${props.config.id}.inputMap`);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure input`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '60vh' }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiText>Expected input</EuiText>
              <EuiButton
                style={{ width: '100px' }}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      // get the current ingest pipeline up to, but not including, this processor
                      const curIngestPipeline = formikToIngestPipeline(
                        values,
                        props.uiConfig,
                        props.config.id,
                        false
                      );
                      // if there are preceding processors, we need to generate the ingest pipeline
                      // up to this point and simulate, in order to get the latest transformed
                      // version of the docs
                      if (curIngestPipeline !== undefined) {
                        const curDocs = prepareDocsForSimulate(
                          values.ingest.docs,
                          values.ingest.index.name
                        );
                        await dispatch(
                          simulatePipeline({
                            pipeline: curIngestPipeline as IngestPipelineConfig,
                            docs: curDocs,
                          })
                        )
                          .unwrap()
                          .then((resp: SimulateIngestPipelineResponse) => {
                            setSourceInput(unwrapTransformedDocs(resp));
                          })
                          .catch((error: any) => {
                            getCore().notifications.toasts.addDanger(
                              `Failed to fetch input data`
                            );
                          });
                      } else {
                        setSourceInput(values.ingest.docs);
                      }
                      break;
                    }
                    // TODO: complete for search request / search response contexts
                  }
                }}
              >
                Fetch
              </EuiButton>
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="15vh"
                value={sourceInput}
                readOnly={true}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                  showLineNumbers: false,
                  showGutter: false,
                  showPrintMargin: false,
                }}
                tabSize={2}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Define transform</EuiText>
              <EuiText size="s" color="subdued">
                {`Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
                root object selector "${JSONPATH_ROOT_SELECTOR}"`}
              </EuiText>
              <EuiSpacer size="s" />
              <MapField
                field={props.inputMapField}
                fieldPath={props.inputMapFieldPath}
                label="Input map"
                helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
                helpLink={ML_INFERENCE_DOCS_LINK}
                keyPlaceholder="Model input field"
                valuePlaceholder="Document field"
                onFormChange={props.onFormChange}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Expected output</EuiText>
              <EuiButton
                style={{ width: '100px' }}
                disabled={isEmpty(map) || isEmpty(JSON.parse(sourceInput))}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      if (!isEmpty(map) && !isEmpty(JSON.parse(sourceInput))) {
                        let sampleSourceInput = {};
                        try {
                          sampleSourceInput = JSON.parse(sourceInput)[0];
                          const output = generateTransform(
                            sampleSourceInput,
                            map
                          );
                          setTransformedOutput(
                            JSON.stringify(output, undefined, 2)
                          );
                        } catch {}
                      }
                      break;
                    }
                    // TODO: complete for search request / search response contexts
                  }
                }}
              >
                Generate
              </EuiButton>
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                width="100%"
                height="15vh"
                value={transformedOutput}
                readOnly={true}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                  showLineNumbers: false,
                  showGutter: false,
                  showPrintMargin: false,
                }}
                tabSize={2}
              />
            </>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={props.onClose} fill={false} color="primary">
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
