/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
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
  EuiSelect,
  EuiSelectOption,
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
import { MapArrayField } from '../input_fields';
import { getDataSourceId } from '../../../../utils/utils';

interface OutputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  outputMapField: IConfigField;
  outputMapFieldPath: string;
  outputFields: any[];
  onClose: () => void;
  onFormChange: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function OutputTransformModal(props: OutputTransformModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('{}');

  // get the current output map
  const map = getIn(values, props.outputMapFieldPath) as MapArrayFormValue;

  // selected output state
  const outputOptions = map.map((_, idx) => ({
    value: idx,
    text: `Prediction output ${idx + 1}`,
  })) as EuiSelectOption[];
  const [selectedOutputOption, setSelectedOutputOption] = useState<
    number | undefined
  >((outputOptions[0]?.value as number) ?? undefined);

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
              <EuiText>Expected input</EuiText>
              <EuiButton
                style={{ width: '100px' }}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      // get the current ingest pipeline up to, and including this processor.
                      // remove any currently-configured output map since we only want the transformation
                      // up to, and including, the input map transformations
                      const valuesWithoutOutputMapConfig = cloneDeep(values);
                      set(
                        valuesWithoutOutputMapConfig,
                        `ingest.enrich.${props.config.id}.outputMap`,
                        []
                      );
                      const curIngestPipeline = formikToIngestPipeline(
                        valuesWithoutOutputMapConfig,
                        props.uiConfig,
                        props.config.id,
                        true
                      ) as IngestPipelineConfig;
                      const curDocs = prepareDocsForSimulate(
                        values.ingest.docs,
                        values.ingest.index.name
                      );
                      await dispatch(
                        simulatePipeline({apiBody:{
                          pipeline: curIngestPipeline,
                          docs: curDocs,
                        },
                      dataSourceId})
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
              <MapArrayField
                field={props.outputMapField}
                fieldPath={props.outputMapFieldPath}
                label="Output Map"
                helpText={`An array specifying how to map the model’s output to new fields.`}
                helpLink={ML_INFERENCE_DOCS_LINK}
                keyPlaceholder="New document field"
                valuePlaceholder="Model output field"
                valueOptions={props.outputFields}
                onFormChange={props.onFormChange}
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
              <EuiSelect
                prepend={<EuiText>Expected output for</EuiText>}
                compressed={true}
                options={outputOptions}
                value={selectedOutputOption}
                onChange={(e) => {
                  setSelectedOutputOption(Number(e.target.value));
                  setTransformedOutput('{}');
                }}
              />
              <EuiSpacer size="s" />
              <EuiButton
                style={{ width: '100px' }}
                disabled={isEmpty(map) || isEmpty(JSON.parse(sourceInput))}
                onClick={async () => {
                  switch (props.context) {
                    case PROCESSOR_CONTEXT.INGEST: {
                      if (
                        !isEmpty(map) &&
                        !isEmpty(JSON.parse(sourceInput)) &&
                        selectedOutputOption !== undefined
                      ) {
                        let sampleSourceInput = {};
                        try {
                          sampleSourceInput = JSON.parse(sourceInput)[0];
                          const output = generateTransform(
                            sampleSourceInput,
                            map[selectedOutputOption]
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
