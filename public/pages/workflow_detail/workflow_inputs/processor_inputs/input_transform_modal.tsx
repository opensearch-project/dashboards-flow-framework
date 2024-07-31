/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import { isEmpty, get } from 'lodash';
import jsonpath from 'jsonpath';
import {
  EuiButton,
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
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
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
import { useLocation } from 'react-router-dom';
import { getDataSourceFromURL } from '../../../../utils/helpers';

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
  const location = useLocation();
  const MDSQueryParams = getDataSourceFromURL(location);
  const dataSourceId = MDSQueryParams.dataSourceId;
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('[]');

  // parse out the values and determine if there are none/some/all valid jsonpaths
  const mapValues = getIn(values, `ingest.enrich.${props.config.id}.inputMap`);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure input`}</p>
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
                          simulatePipeline({body:{
                            pipeline: curIngestPipeline as IngestPipelineConfig,
                            docs: curDocs,
                          }, dataSourceId: dataSourceId})
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
                disabled={
                  isEmpty(mapValues) || isEmpty(JSON.parse(sourceInput))
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
                            const path = mapValue.value;
                            try {
                              let transformedResult = undefined;
                              // ML inference processors will use standard dot notation or JSONPath depending on the input.
                              // We follow the same logic here to generate consistent results.
                              if (
                                mapValue.value.startsWith(
                                  JSONPATH_ROOT_SELECTOR
                                )
                              ) {
                                // JSONPath transform
                                transformedResult = jsonpath.query(
                                  sampleSourceInput,
                                  path
                                );
                                // Bracket notation not supported - throw an error
                              } else if (
                                mapValue.value.includes(']') ||
                                mapValue.value.includes(']')
                              ) {
                                throw new Error();
                                // Standard dot notation
                              } else {
                                transformedResult = get(
                                  sampleSourceInput,
                                  path
                                );
                              }

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
                                'Error generating expected output. Ensure your inputs are valid JSONPath or dot notation syntax.',
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
        <EuiButton onClick={props.onClose} fill={false} color="primary">
          Close
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
