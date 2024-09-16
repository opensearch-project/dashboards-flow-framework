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
} from '@elastic/eui';
import {
  IConfigField,
  IProcessorConfig,
  IngestPipelineConfig,
  JSONPATH_ROOT_SELECTOR,
  ML_INFERENCE_DOCS_LINK,
  MapArrayFormValue,
  ModelInterface,
  PROCESSOR_CONTEXT,
  SearchHit,
  SearchPipelineConfig,
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
import { MapArrayField } from '../input_fields';
import { getDataSourceId, parseModelOutputs } from '../../../../utils/utils';

interface OutputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  outputMapField: IConfigField;
  outputMapFieldPath: string;
  modelInterface: ModelInterface | undefined;
  onClose: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function OutputTransformModal(props: OutputTransformModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();

  // fetching input data state
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // source output / transformed output state
  const [sourceOutput, setSourceOutput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('{}');

  // get the current output map
  const map = getIn(values, props.outputMapFieldPath) as MapArrayFormValue;

  // selected transform state
  const transformOptions = map.map((_, idx) => ({
    value: idx,
    text: `Prediction ${idx + 1}`,
  })) as EuiSelectOption[];
  const [selectedTransformOption, setSelectedTransformOption] = useState<
    number | undefined
  >((transformOptions[0]?.value as number) ?? undefined);

  // hook to re-generate the transform when any inputs to the transform are updated
  useEffect(() => {
    if (
      !isEmpty(map) &&
      !isEmpty(JSON.parse(sourceOutput)) &&
      selectedTransformOption !== undefined
    ) {
      let sampleSourceOutput = {};
      try {
        sampleSourceOutput = JSON.parse(sourceOutput);
        const output = generateTransform(
          sampleSourceOutput,
          map[selectedTransformOption]
        );
        setTransformedOutput(customStringify(output));
      } catch {}
    }
  }, [map, sourceOutput, selectedTransformOption]);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure output`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody style={{ height: '60vh' }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiText color="subdued">
                Fetch some sample output data and see how it is transformed.
              </EuiText>
              <EuiSpacer size="s" />
              <EuiText>Source output</EuiText>
              <EuiSmallButton
                style={{ width: '100px' }}
                isLoading={isFetching}
                onClick={async () => {
                  setIsFetching(true);
                  switch (props.context) {
                    // note we skip search request processor context. that is because empty output maps are not supported.
                    // for more details, see comment in ml_processor_inputs.tsx
                    case PROCESSOR_CONTEXT.INGEST: {
                      // get the current ingest pipeline up to, and including this processor.
                      // remove any currently-configured output map since we only want the transformation
                      // up to, and including, the input map transformations
                      const valuesWithoutOutputMapConfig = cloneDeep(values);
                      set(
                        valuesWithoutOutputMapConfig,
                        `ingest.enrich.${props.config.id}.output_map`,
                        []
                      );
                      const curIngestPipeline = formikToPartialPipeline(
                        valuesWithoutOutputMapConfig,
                        props.uiConfig,
                        props.config.id,
                        true,
                        PROCESSOR_CONTEXT.INGEST
                      ) as IngestPipelineConfig;
                      const curDocs = prepareDocsForSimulate(
                        values.ingest.docs,
                        values.ingest.index.name
                      );
                      await dispatch(
                        simulatePipeline({
                          apiBody: {
                            pipeline: curIngestPipeline,
                            docs: [curDocs[0]],
                          },
                          dataSourceId,
                        })
                      )
                        .unwrap()
                        .then((resp: SimulateIngestPipelineResponse) => {
                          try {
                            const docObjs = unwrapTransformedDocs(resp);
                            if (docObjs.length > 0) {
                              const sampleModelResult =
                                docObjs[0]?.inference_results || {};
                              setSourceOutput(
                                customStringify(sampleModelResult)
                              );
                            }
                          } catch {}
                        })
                        .catch((error: any) => {
                          getCore().notifications.toasts.addDanger(
                            `Failed to fetch input data`
                          );
                        })
                        .finally(() => {
                          setIsFetching(false);
                        });
                      break;
                    }
                    case PROCESSOR_CONTEXT.SEARCH_RESPONSE: {
                      // get the current search pipeline up to, and including this processor.
                      // remove any currently-configured output map since we only want the transformation
                      // up to, and including, the input map transformations
                      const valuesWithoutOutputMapConfig = cloneDeep(values);
                      set(
                        valuesWithoutOutputMapConfig,
                        `search.enrichResponse.${props.config.id}.output_map`,
                        []
                      );
                      const curSearchPipeline = formikToPartialPipeline(
                        valuesWithoutOutputMapConfig,
                        props.uiConfig,
                        props.config.id,
                        true,
                        PROCESSOR_CONTEXT.SEARCH_RESPONSE
                      ) as SearchPipelineConfig;

                      // Execute search. Augment the existing query with
                      // the partial search pipeline (inline) to get the latest transformed
                      // version of the request.
                      dispatch(
                        searchIndex({
                          apiBody: {
                            index: values.ingest.index.name,
                            body: JSON.stringify({
                              ...JSON.parse(values.search.request as string),
                              search_pipeline: curSearchPipeline || {},
                            }),
                          },
                          dataSourceId,
                        })
                      )
                        .unwrap()
                        .then(async (resp) => {
                          const hits = resp.hits.hits.map(
                            (hit: SearchHit) => hit._source
                          ) as any[];
                          if (hits.length > 0) {
                            const sampleModelResult =
                              hits[0].inference_results || {};
                            setSourceOutput(customStringify(sampleModelResult));
                          }
                        })
                        .catch((error: any) => {
                          getCore().notifications.toasts.addDanger(
                            `Failed to fetch source output data`
                          );
                        })
                        .finally(() => {
                          setIsFetching(false);
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
                value={sourceOutput}
                readOnly={true}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                  showLineNumbers: false,
                  showGutter: false,
                  showPrintMargin: false,
                  wrap: true,
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
                field={props.outputMapField}
                fieldPath={props.outputMapFieldPath}
                label="Output Map"
                helpText={`An array specifying how to map the model’s output to new fields. Dot notation is used by default. To explicitly use JSONPath, please ensure to prepend with the
                root object selector "${JSONPATH_ROOT_SELECTOR}"`}
                helpLink={ML_INFERENCE_DOCS_LINK}
                keyPlaceholder="Document field"
                valuePlaceholder="Model output field"
                valueOptions={parseModelOutputs(props.modelInterface)}
                // If the map we are adding is the first one, populate the selected option to index 0
                onMapAdd={(curArray) => {
                  if (isEmpty(curArray)) {
                    setSelectedTransformOption(0);
                  }
                }}
                // If the map we are deleting is the one we last used to test, reset the state and
                // default to the first map in the list.
                onMapDelete={(idxToDelete) => {
                  if (selectedTransformOption === idxToDelete) {
                    setSelectedTransformOption(0);
                    setTransformedOutput('{}');
                  }
                }}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              {transformOptions.length <= 1 ? (
                <EuiText>Transformed output</EuiText>
              ) : (
                <EuiCompressedSelect
                  prepend={<EuiText>Transformed output for</EuiText>}
                  options={transformOptions}
                  value={selectedTransformOption}
                  onChange={(e) => {
                    setSelectedTransformOption(Number(e.target.value));
                  }}
                />
              )}
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
                  wrap: true,
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
