/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import { isEmpty } from 'lodash';
import jsonpath from 'jsonpath';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiCodeBlock,
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
  PROCESSOR_CONTEXT,
  SimulateIngestPipelineDoc,
  SimulateIngestPipelineResponse,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../../../../common';
import { formikToIngestPipeline, generateId } from '../../../../utils';
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
  onConfirm: () => void;
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

  const mapValues = getIn(values, `ingest.enrich.${props.config.id}.inputMap`);
  const containsInvalidJsonPaths =
    mapValues.find(
      (mapValue: { key: string; value: string }) =>
        !mapValue.value.startsWith('$.')
    ) !== undefined;

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure JSONPath input transforms`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiText>Expected input</EuiText>
              <EuiButton
                style={{ width: '100px' }}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      const curIngestPipeline = formikToIngestPipeline(
                        values,
                        props.uiConfig,
                        props.config.id
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
                              `Failed to fetch input schema`
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
              <EuiCodeBlock fontSize="m" isCopyable={false}>
                {sourceInput}
              </EuiCodeBlock>
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Define transform with JSONPath</EuiText>
              <EuiText size="s" color="subdued">
                To explicitly use JSONPath, please ensure to prepend with the
                root object selector "$"
              </EuiText>
              <EuiSpacer size="s" />
              <MapField
                field={props.inputMapField}
                fieldPath={props.inputMapFieldPath}
                label="Input map"
                helpText={`An array specifying how to map fields from the ingested document to the model’s input.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                keyPlaceholder="Model input field"
                valuePlaceholder="JSONPath ($...)"
                onFormChange={props.onFormChange}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Expected output</EuiText>
              {containsInvalidJsonPaths && (
                <>
                  <EuiCallOut
                    title={`Ensure all JSONPath entries start with the root selector "$."`}
                    iconType={'alert'}
                    color="warning"
                  />
                  <EuiSpacer size="s" />
                </>
              )}

              <EuiButton
                style={{ width: '100px' }}
                disabled={
                  isEmpty(mapValues) ||
                  isEmpty(JSON.parse(sourceInput)) ||
                  containsInvalidJsonPaths
                }
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      if (
                        !isEmpty(mapValues) &&
                        !isEmpty(JSON.parse(sourceInput))
                      ) {
                        let output = {};
                        let sampleSourceInput = {};
                        try {
                          sampleSourceInput = JSON.parse(sourceInput)[0];
                        } catch {}

                        mapValues.forEach(
                          (mapValue: { key: string; value: string }) => {
                            const jsonpathInput = mapValue.value;
                            try {
                              const transformedResult = jsonpath.query(
                                sampleSourceInput,
                                jsonpathInput
                              );
                              output = {
                                ...output,
                                [mapValue.key]: transformedResult || '',
                              };

                              setTransformedOutput(
                                JSON.stringify(output, undefined, 2)
                              );
                            } catch (e: any) {
                              console.error(e);
                              getCore().notifications.toasts.addDanger(
                                'Error generating expected output. Ensure your inputs are valid JSONPath syntax.',
                                e
                              );
                            }
                          }
                        );
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
              <EuiCodeBlock fontSize="m" isCopyable={false}>
                {transformedOutput}
              </EuiCodeBlock>
            </>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={props.onClose}>Cancel</EuiButtonEmpty>
        <EuiButton onClick={props.onConfirm} fill={true} color="primary">
          Save
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}

// docs are expected to be in a certain format to be passed to the simulate ingest pipeline API.
// for details, see https://opensearch.org/docs/latest/ingest-pipelines/simulate-ingest
function prepareDocsForSimulate(
  docs: string,
  indexName: string
): SimulateIngestPipelineDoc[] {
  const preparedDocs = [] as SimulateIngestPipelineDoc[];
  const docObjs = JSON.parse(docs) as {}[];
  docObjs.forEach((doc) => {
    preparedDocs.push({
      _index: indexName,
      _id: generateId(),
      _source: doc,
    });
  });
  return preparedDocs;
}

// docs are returned in a certain format from the simulate ingest pipeline API. We want
// to format them into a more readable string to display
function unwrapTransformedDocs(
  simulatePipelineResponse: SimulateIngestPipelineResponse
) {
  let errorDuringSimulate = undefined as string | undefined;
  const transformedDocsSources = simulatePipelineResponse.docs.map(
    (transformedDoc) => {
      if (transformedDoc.error !== undefined) {
        errorDuringSimulate = transformedDoc.error.reason || '';
      } else {
        return transformedDoc.doc._source;
      }
    }
  );

  // there is an edge case where simulate may fail if there is some server-side or OpenSearch issue when
  // running ingest (e.g., hitting rate limits on remote model)
  // We pull out any returned error from a document and propagate it to the user.
  if (errorDuringSimulate !== undefined) {
    getCore().notifications.toasts.addDanger(
      `Failed to simulate ingest on all documents: ${errorDuringSimulate}`
    );
  }
  return JSON.stringify(transformedDocsSources, undefined, 2);
}
