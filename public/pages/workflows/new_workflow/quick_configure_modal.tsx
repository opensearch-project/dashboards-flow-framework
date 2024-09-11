/*
 * Copyright OpenSearch Contributorsd
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { flattie } from 'flattie';
import {
  EuiSmallButton,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiCompressedFieldText,
  EuiCompressedFormRow,
} from '@elastic/eui';
import {
  IMAGE_FIELD_PATTERN,
  IndexMappings,
  LABEL_FIELD_PATTERN,
  MODEL_ID_PATTERN,
  MapArrayFormValue,
  MapFormValue,
  ModelInterface,
  PROCESSOR_TYPE,
  QuickConfigureFields,
  TEXT_FIELD_PATTERN,
  VECTOR,
  VECTOR_FIELD_PATTERN,
  WORKFLOW_NAME_REGEXP,
  WORKFLOW_TYPE,
  Workflow,
  WorkflowConfig,
  customStringify,
  isVectorSearchUseCase,
} from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { AppState, createWorkflow, useAppDispatch } from '../../../store';
import {
  constructUrlWithParams,
  getDataSourceId,
  parseModelInputs,
  parseModelOutputs,
} from '../../../utils/utils';
import { QuickConfigureInputs } from './quick_configure_inputs';

interface QuickConfigureModalProps {
  workflow: Workflow;
  onClose(): void;
}

// Modal to handle workflow creation. Includes a static field to set the workflow name, and
// an optional set of quick-configure fields, that when populated, help pre-populate
// some of the detailed workflow configuration.
export function QuickConfigureModal(props: QuickConfigureModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const history = useHistory();
  const { models } = useSelector((state: AppState) => state.ml);

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // workflow name state
  const [workflowName, setWorkflowName] = useState<string>(
    processWorkflowName(props.workflow.name)
  );

  const [quickConfigureFields, setQuickConfigureFields] = useState<
    QuickConfigureFields
  >({});

  // is creating state
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // custom sanitization on workflow name
  function isInvalidName(name: string): boolean {
    return (
      name === '' ||
      name.length > 100 ||
      WORKFLOW_NAME_REGEXP.test(name) === false
    );
  }

  // fetching model interface if available. used to prefill some
  // of the input/output maps
  useEffect(() => {
    setModelInterface(models[quickConfigureFields.modelId || '']?.interface);
  }, [models, quickConfigureFields.modelId]);

  return (
    <EuiModal onClose={() => props.onClose()} style={{ width: '30vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Quick configure`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiCompressedFormRow
          label={'Name'}
          error={'Invalid name'}
          isInvalid={isInvalidName(workflowName)}
        >
          <EuiCompressedFieldText
            placeholder={processWorkflowName(props.workflow.name)}
            value={workflowName}
            onChange={(e) => {
              setWorkflowName(e.target.value);
            }}
          />
        </EuiCompressedFormRow>
        <QuickConfigureInputs
          workflowType={props.workflow.ui_metadata?.type}
          setFields={setQuickConfigureFields}
        />
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButtonEmpty onClick={() => props.onClose()}>
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton
          disabled={isInvalidName(workflowName) || isCreating}
          isLoading={isCreating}
          onClick={() => {
            setIsCreating(true);
            let workflowToCreate = {
              ...props.workflow,
              name: workflowName,
            };
            if (!isEmpty(quickConfigureFields)) {
              workflowToCreate = injectQuickConfigureFields(
                workflowToCreate,
                quickConfigureFields,
                modelInterface
              );
            }
            dispatch(
              createWorkflow({
                apiBody: workflowToCreate,
                dataSourceId,
              })
            )
              .unwrap()
              .then((result) => {
                setIsCreating(false);
                const { workflow } = result;
                history.replace(
                  constructUrlWithParams(
                    APP_PATH.WORKFLOWS,

                    workflow.id,
                    dataSourceId
                  )
                );
              })
              .catch((err: any) => {
                setIsCreating(false);
                console.error(err);
              });
          }}
          fill={true}
          color="primary"
        >
          Create
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}

// helper fn to populate UI config values if there are some quick configure fields available
function injectQuickConfigureFields(
  workflow: Workflow,
  quickConfigureFields: QuickConfigureFields,
  modelInterface: ModelInterface | undefined
): Workflow {
  if (workflow.ui_metadata?.type) {
    switch (workflow.ui_metadata?.type) {
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.HYBRID_SEARCH:
      case WORKFLOW_TYPE.MULTIMODAL_SEARCH:
      case WORKFLOW_TYPE.SENTIMENT_ANALYSIS: {
        if (!isEmpty(quickConfigureFields) && workflow.ui_metadata?.config) {
          workflow.ui_metadata.config = updateIngestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            modelInterface,
            isVectorSearchUseCase(workflow)
          );
          workflow.ui_metadata.config = updateIndexConfig(
            workflow.ui_metadata.config,
            quickConfigureFields
          );
          workflow.ui_metadata.config.search.request.value = injectPlaceholderValues(
            (workflow.ui_metadata.config.search.request.value || '') as string,
            quickConfigureFields
          );
          workflow.ui_metadata.config = updateSearchRequestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            modelInterface,
            isVectorSearchUseCase(workflow)
          );
        }
        break;
      }
      case WORKFLOW_TYPE.RAG: {
        if (!isEmpty(quickConfigureFields) && workflow.ui_metadata?.config) {
          workflow.ui_metadata.config = updateSearchResponseProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            modelInterface
          );
        }
        break;
      }
      case WORKFLOW_TYPE.CUSTOM:
      case undefined:
      default:
        break;
    }
  }
  return workflow;
}

// prefill ingest processor configs, if applicable
function updateIngestProcessors(
  config: WorkflowConfig,
  fields: QuickConfigureFields,
  modelInterface: ModelInterface | undefined,
  isVectorSearchUseCase: boolean
): WorkflowConfig {
  config.ingest.enrich.processors.forEach((processor, idx) => {
    // prefill ML inference
    if (processor.type === PROCESSOR_TYPE.ML) {
      config.ingest.enrich.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.modelId) {
          field.value = { id: fields.modelId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateMapFromModelInputs(modelInterface);
          if (fields.textField) {
            if (inputMap.length > 0) {
              inputMap[0] = {
                ...inputMap[0],
                value: fields.textField,
              };
            } else {
              inputMap.push({
                key: '',
                value: fields.textField,
              });
            }
          }
          if (fields.imageField) {
            if (inputMap.length > 1) {
              inputMap[1] = {
                ...inputMap[1],
                value: fields.imageField,
              };
            } else {
              inputMap.push({
                key: '',
                value: fields.imageField,
              });
            }
          }
          field.value = [inputMap] as MapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateMapFromModelOutputs(modelInterface);
          const defaultField = isVectorSearchUseCase
            ? fields.vectorField
            : fields.labelField;
          if (defaultField) {
            if (outputMap.length > 0) {
              outputMap[0] = {
                ...outputMap[0],
                key: defaultField,
              };
            } else {
              outputMap.push({ key: defaultField, value: '' });
            }
          }
          field.value = [outputMap] as MapArrayFormValue;
        }
      });
    }
  });
  return config;
}

// prefill search request processor configs, if applicable
function updateSearchRequestProcessors(
  config: WorkflowConfig,
  fields: QuickConfigureFields,
  modelInterface: ModelInterface | undefined,
  isVectorSearchUseCase: boolean
): WorkflowConfig {
  config.search.enrichRequest.processors.forEach((processor, idx) => {
    // prefill ML inference
    if (processor.type === PROCESSOR_TYPE.ML) {
      let defaultQueryValue = '' as string;
      try {
        defaultQueryValue = Object.keys(
          flattie(JSON.parse(config.search?.request?.value as string))
        )[0];
      } catch {}
      config.search.enrichRequest.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.modelId) {
          field.value = { id: fields.modelId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateMapFromModelInputs(modelInterface);
          if (inputMap.length > 0) {
            inputMap[0] = {
              ...inputMap[0],
              value: defaultQueryValue,
            };
          } else {
            inputMap.push({
              key: '',
              value: defaultQueryValue,
            });
          }
          field.value = [inputMap] as MapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateMapFromModelOutputs(modelInterface);
          const defaultKey = isVectorSearchUseCase ? VECTOR : defaultQueryValue;
          if (outputMap.length > 0) {
            outputMap[0] = {
              ...outputMap[0],
              key: defaultKey,
            };
          } else {
            outputMap.push({
              key: defaultKey,
              value: '',
            });
          }
          field.value = [outputMap] as MapArrayFormValue;
        }
      });
      config.search.enrichRequest.processors[0].optionalFields = config.search.enrichRequest.processors[0].optionalFields?.map(
        (optionalField) => {
          let updatedOptionalField = optionalField;
          if (optionalField.id === 'query_template') {
            optionalField.value = injectPlaceholderValues(
              (optionalField.value || '') as string,
              fields
            );
          }
          return updatedOptionalField;
        }
      );
    }
  });
  return config;
}

// prefill response processor configs, if applicable
function updateSearchResponseProcessors(
  config: WorkflowConfig,
  fields: QuickConfigureFields,
  modelInterface: ModelInterface | undefined
): WorkflowConfig {
  config.search.enrichResponse.processors.forEach((processor, idx) => {
    // prefill ML inference
    if (processor.type === PROCESSOR_TYPE.ML) {
      config.search.enrichResponse.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.modelId) {
          field.value = { id: fields.modelId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateMapFromModelInputs(modelInterface);
          if (fields.textField) {
            if (inputMap.length > 0) {
              inputMap[0] = {
                ...inputMap[0],
                value: fields.textField,
              };
            } else {
              inputMap.push({
                key: '',
                value: fields.textField,
              });
            }
          }
          field.value = [inputMap] as MapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateMapFromModelOutputs(modelInterface);
          if (fields.llmResponseField) {
            if (outputMap.length > 0) {
              outputMap[0] = {
                ...outputMap[0],
                key: fields.llmResponseField,
              };
            } else {
              outputMap.push({ key: fields.llmResponseField, value: '' });
            }
          }
          field.value = [outputMap] as MapArrayFormValue;
        }
      });
    }
    // prefill collapse
    if (processor.type === PROCESSOR_TYPE.COLLAPSE) {
      config.search.enrichResponse.processors[idx].fields.forEach((field) => {
        if (field.id === 'field' && fields.llmResponseField) {
          field.value = fields.llmResponseField;
        }
      });
    }
  });
  return config;
}

// prefill index mappings/settings, if applicable
function updateIndexConfig(
  config: WorkflowConfig,
  fields: QuickConfigureFields
): WorkflowConfig {
  if (
    fields.textField ||
    fields.imageField ||
    fields.vectorField ||
    fields.labelField
  ) {
    const existingMappings = JSON.parse(
      config.ingest.index.mappings.value as string
    );
    let properties = {} as { [key: string]: {} };
    try {
      properties = (JSON.parse(
        config.ingest.index.mappings.value as string
      ) as IndexMappings).properties;
    } catch {}
    if (fields.textField) {
      properties[fields.textField] = {
        type: 'text',
      };
    }
    if (fields.imageField) {
      properties[fields.imageField] = {
        type: 'binary',
      };
    }
    if (fields.vectorField) {
      properties[fields.vectorField] = {
        type: 'knn_vector',
        dimension: fields.embeddingLength || '',
      };
    }
    if (fields.labelField) {
      properties[fields.labelField] = {
        type: 'text',
      };
    }
    config.ingest.index.mappings.value = customStringify({
      ...existingMappings,
      properties: { ...properties },
    });
  }
  return config;
}

// pre-populate placeholders for a query request string
function injectPlaceholderValues(
  requestString: string,
  fields: QuickConfigureFields
): string {
  let finalRequestString = requestString;
  if (fields.modelId) {
    finalRequestString = finalRequestString.replace(
      new RegExp(MODEL_ID_PATTERN, 'g'),
      fields.modelId
    );
  }
  if (fields.textField) {
    finalRequestString = finalRequestString.replace(
      new RegExp(TEXT_FIELD_PATTERN, 'g'),
      fields.textField
    );
  }
  if (fields.vectorField) {
    finalRequestString = finalRequestString.replace(
      new RegExp(VECTOR_FIELD_PATTERN, 'g'),
      fields.vectorField
    );
  }
  if (fields.imageField) {
    finalRequestString = finalRequestString.replace(
      new RegExp(IMAGE_FIELD_PATTERN, 'g'),
      fields.imageField
    );
  }
  if (fields.labelField) {
    finalRequestString = finalRequestString.replace(
      new RegExp(LABEL_FIELD_PATTERN, 'g'),
      fields.labelField
    );
  }
  return finalRequestString;
}

// generate a set of mappings s.t. each key is
// a unique model input.
function generateMapFromModelInputs(
  modelInterface?: ModelInterface
): MapFormValue {
  const inputMap = [] as MapFormValue;
  if (modelInterface) {
    const modelInputs = parseModelInputs(modelInterface);
    modelInputs.forEach((modelInput) => {
      inputMap.push({
        key: modelInput.label,
        value: '',
      });
    });
  }
  return inputMap;
}

// generate a set of mappings s.t. each value is
// a unique model output
function generateMapFromModelOutputs(
  modelInterface?: ModelInterface
): MapFormValue {
  const outputMap = [] as MapFormValue;
  if (modelInterface) {
    const modelOutputs = parseModelOutputs(modelInterface);
    modelOutputs.forEach((modelOutput) => {
      outputMap.push({
        key: '',
        value: modelOutput.label,
      });
    });
  }
  return outputMap;
}
