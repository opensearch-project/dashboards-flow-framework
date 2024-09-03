/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  EuiCompressedSelect,
  EuiSelectOption,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  MapArrayFormValue,
  PROCESSOR_CONTEXT,
  SearchHit,
  SimulateIngestPipelineResponse,
  WorkflowConfig,
  WorkflowFormValues,
  customStringify,
} from '../../../../../common';
import {
  formikToPartialPipeline,
  generateTransform,
  prepareDocsForSimulate,
  unwrapTransformedDocs,
} from '../../../../utils';
import {
  searchIndex,
  simulatePipeline,
  useAppDispatch,
} from '../../../../store';
import { getCore } from '../../../../services';
import { getDataSourceId } from '../../../../utils/utils';
import { MapArrayField } from '../input_fields';

interface InputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  inputMapField: IConfigField;
  inputMapFieldPath: string;
  inputFields: any[];
  onClose: () => void;
}

// TODO: InputTransformModal and OutputTransformModal are very similar, and can
// likely be refactored and have more reusable components. Leave as-is until the
// UI is more finalized.

/**
 * A modal to configure advanced JSON-to-JSON transforms into a model's expected input
 */
export function InputTransformModal(props: InputTransformModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('{}');

  // get the current input map
  const map = getIn(values, props.inputMapFieldPath) as MapArrayFormValue;

  // selected output state
  const outputOptions = map.map((_, idx) => ({
    value: idx,
    text: `Prediction ${idx + 1}`,
  })) as EuiSelectOption[];
  const [selectedOutputOption, setSelectedOutputOption] = useState<
    number | undefined
  >((outputOptions[0]?.value as number) ?? undefined);

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
              <EuiText color="subdued">
                Fetch some sample input data and how it is transformed.
              </EuiText>
              <EuiSpacer size="s" />
              <EuiText>Expected input</EuiText>
              <EuiSmallButton
                style={{ width: '100px' }}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      // get the current ingest pipeline up to, but not including, this processor
                      const curIngestPipeline = formikToPartialPipeline(
                        values,
                        props.uiConfig,
                        props.config.id,
                        false,
                        PROCESSOR_CONTEXT.INGEST
                      );
                      // if there are preceding processors, we need to simulate the partial ingest pipeline,
                      // in order to get the latest transformed version of the docs
                      if (curIngestPipeline !== undefined) {
                        const curDocs = prepareDocsForSimulate(
                          values.ingest.docs,
                          values.ingest.index.name
                        );
                        await dispatch(
                          simulatePipeline({
                            apiBody: {
                              pipeline: curIngestPipeline as IngestPipelineConfig,
                              docs: [curDocs[0]],
                            },
                            dataSourceId,
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
                        try {
                          const docObjs = JSON.parse(
                            values.ingest.docs
                          ) as {}[];
                          if (docObjs.length > 0)
                            setSourceInput(customStringify([docObjs[0]]));
                        } catch {}
                      }
                      break;
                    }
                    case PROCESSOR_CONTEXT.SEARCH_REQUEST: {
                      // get the current search pipeline up to, but not including, this processor
                      const curSearchPipeline = formikToPartialPipeline(
                        values,
                        props.uiConfig,
                        props.config.id,
                        false,
                        PROCESSOR_CONTEXT.SEARCH_REQUEST
                      );
                      // if there are preceding processors, we cannot generate. The button to render
                      // this modal should be disabled if the search pipeline would be enabled. We add
                      // this if check as an extra layer of checking, and if mechanism for gating
                      // this is changed in the future.
                      if (curSearchPipeline === undefined) {
                        setSourceInput(values.search.request);
                      }
                      break;
                    }
                    case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
                      // get the current search pipeline up to, but not including, this processor
                      const curSearchPipeline = formikToPartialPipeline(
                        values,
                        props.uiConfig,
                        props.config.id,
                        false,
                        PROCESSOR_CONTEXT.SEARCH_RESPONSE
                      );
                      // Execute search. If there are preceding processors, augment the existing query with
                      // the partial search pipeline (inline) to get the latest transformed version of the response.
                      dispatch(
                        searchIndex({
                          apiBody: {
                            index: values.search.index.name,
                            body: JSON.stringify({
                              ...JSON.parse(values.search.request as string),
                              search_pipeline: curSearchPipeline,
                            }),
                          },
                          dataSourceId,
                        })
                      )
                        .unwrap()
                        .then(async (resp) => {
                          setSourceInput(
                            JSON.stringify(
                              resp.hits.hits.map(
                                (hit: SearchHit) => hit._source
                              ),
                              undefined,
                              2
                            )
                          );
                        })
                        .catch((error: any) => {
                          getCore().notifications.toasts.addDanger(
                            `Failed to fetch input data`
                          );
                        });
                      break;
                    }
                  }
                }}
              >
                Fetch
              </EuiSmallButton>
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
              <EuiSpacer size="s" />
              <MapArrayField
                field={props.inputMapField}
                fieldPath={props.inputMapFieldPath}
                label="Input Map"
                helpText={`An array specifying how to map fields from the ingested document to the model’s input. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
                root object selector "${JSONPATH_ROOT_SELECTOR}"`}
                helpLink={ML_INFERENCE_DOCS_LINK}
                keyPlaceholder="Model input field"
                valuePlaceholder={
                  props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
                    ? 'Query field'
                    : 'Document field'
                }
                keyOptions={props.inputFields}
                // If the map we are adding is the first one, populate the selected option to index 0
                onMapAdd={(curArray) => {
                  if (isEmpty(curArray)) {
                    setSelectedOutputOption(0);
                  }
                }}
                // If the map we are deleting is the one we last used to test, reset the state and
                // default to the first map in the list.
                onMapDelete={(idxToDelete) => {
                  if (selectedOutputOption === idxToDelete) {
                    setSelectedOutputOption(0);
                    setTransformedOutput('{}');
                  }
                }}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiCompressedSelect
                prepend={<EuiText>Expected output for</EuiText>}
                options={outputOptions}
                value={selectedOutputOption}
                onChange={(e) => {
                  setSelectedOutputOption(Number(e.target.value));
                  setTransformedOutput('{}');
                }}
              />
              <EuiSpacer size="s" />
              <EuiSmallButton
                style={{ width: '100px' }}
                disabled={isEmpty(map) || isEmpty(JSON.parse(sourceInput))}
                onClick={async () => {
                  if (
                    !isEmpty(map) &&
                    !isEmpty(JSON.parse(sourceInput)) &&
                    selectedOutputOption !== undefined
                  ) {
                    let sampleSourceInput = {};
                    try {
                      // In the context of ingest or search resp, this input will be an array (list of docs)
                      // In the context of request, it will be a single JSON
                      sampleSourceInput =
                        props.context === PROCESSOR_CONTEXT.INGEST ||
                        props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE
                          ? JSON.parse(sourceInput)[0]
                          : JSON.parse(sourceInput);
                      const output = generateTransform(
                        sampleSourceInput,
                        map[selectedOutputOption]
                      );
                      setTransformedOutput(customStringify(output));
                    } catch {}
                  }
                }}
              >
                Generate
              </EuiSmallButton>
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
        <EuiSmallButton onClick={props.onClose} fill={false} color="primary">
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
