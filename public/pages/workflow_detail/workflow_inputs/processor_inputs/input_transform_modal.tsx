/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
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

interface InputTransformModalProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  context: PROCESSOR_CONTEXT;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A modal to configure advanced JSON-to-JSON transforms into a model's expected input
 */
export function InputTransformModal(props: InputTransformModalProps) {
  const dispatch = useAppDispatch();
  const { values } = useFormikContext<WorkflowFormValues>();

  // source input / transformed output state
  const [sourceInput, setSourceInput] = useState<string>('{}');
  const [transformedOutput, setTransformedOutput] = useState<string>('{}');

  return (
    <EuiModal onClose={props.onClose} style={{ width: '70vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Configure input transform`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <>
              <EuiButton
                style={{ width: '250px' }}
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
                          values.ingest.indexName
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
                        // TODO: change to bulk API
                        const ingestDocObj = JSON.parse(values.ingest.docs);
                        const ingestDocsObjs = [ingestDocObj];
                        setSourceInput(
                          JSON.stringify(ingestDocsObjs, undefined, 2)
                        );
                      }
                      break;
                    }
                    // TODO: complete for search request / search response contexts
                  }
                }}
              >
                Fetch expected input
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
              <EuiSpacer size="s" />
              <EuiCodeEditor
                mode="json"
                theme="textmate"
                value={`{"a": "b"}`}
                readOnly={false}
                setOptions={{
                  fontSize: '12px',
                  autoScrollEditorIntoView: true,
                }}
                tabSize={2}
              />
            </>
          </EuiFlexItem>
          <EuiFlexItem>
            <>
              <EuiText>Expected output</EuiText>
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
  // TODO: enhance to support bulk/multiple documents
  return [
    {
      _index: indexName,
      _id: generateId(),
      _source: JSON.parse(docs),
    },
  ];
}

// docs are returned in a certain format from the simulate ingest pipeline API. We want
// to format them into a more readable string to display
function unwrapTransformedDocs(
  simulatePipelineResponse: SimulateIngestPipelineResponse
) {
  const transformedDocsSources = simulatePipelineResponse.docs.map(
    (transformedDoc) => transformedDoc.doc._source
  );
  return JSON.stringify(transformedDocsSources, undefined, 2);
}
