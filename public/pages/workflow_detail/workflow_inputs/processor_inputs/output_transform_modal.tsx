/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext, getIn } from 'formik';
import { cloneDeep, isEmpty, set } from 'lodash';
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

interface OutputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  outputMapField: IConfigField;
  outputMapFieldPath: string;
  onClose: () => void;
  onFormChange: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms from a model's expected output
 */
export function OutputTransformModal(props: OutputTransformModalProps) {
  const dispatch = useAppDispatch();
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('[]');
  const [transformedOutput, setTransformedOutput] = useState<string>('[]');

  // get the current output map
  const map = getIn(values, `ingest.enrich.${props.config.id}.outputMap`);

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure output`}</p>
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
                        simulatePipeline({
                          pipeline: curIngestPipeline,
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
                field={props.outputMapField}
                fieldPath={props.outputMapFieldPath}
                label="Output map"
                helpText={`An array specifying how to map fields from the model's output to the new document fields.`}
                helpLink={
                  'https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/#configuration-parameters'
                }
                keyPlaceholder="New document field"
                valuePlaceholder="Model output field"
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
