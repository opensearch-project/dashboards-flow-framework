/*
 * Copyright OpenSearch Contributorsd
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { Formik, getIn } from 'formik';
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
  EuiFlexItem,
  EuiFlexGroup,
  EuiCallOut,
  EuiSpacer,
  EuiText,
  EuiLink,
} from '@elastic/eui';
import {
  DEFAULT_PROMPT_RESULTS_FIELD,
  EMPTY_INPUT_MAP_ENTRY,
  EMPTY_OUTPUT_MAP_ENTRY,
  IMAGE_FIELD_PATTERN,
  IndexMappings,
  InputMapArrayFormValue,
  InputMapFormValue,
  LABEL_FIELD_PATTERN,
  MODEL_ID_PATTERN,
  ModelInterface,
  OutputMapArrayFormValue,
  OutputMapFormValue,
  PROCESSOR_TYPE,
  QuickConfigureFields,
  CLAUDE_SUMMARIZE_PROMPT,
  TEXT_FIELD_PATTERN,
  TRANSFORM_TYPE,
  VECTOR,
  VECTOR_FIELD_PATTERN,
  WORKFLOW_NAME_REGEXP,
  WORKFLOW_TYPE,
  Workflow,
  WorkflowConfig,
  customStringify,
  isVectorSearchUseCase,
  WORKFLOW_NAME_RESTRICTIONS,
  MAX_DESCRIPTION_LENGTH,
  MapFormValue,
  MAX_STRING_LENGTH,
  Model,
  MODEL_STATE,
  ML_REMOTE_MODEL_LINK,
  MODEL_CATEGORY,
  isRAGUseCase,
} from '../../../../common';
import { APP_PATH, getInitialValue } from '../../../utils';
import { AppState, createWorkflow, useAppDispatch } from '../../../store';
import {
  constructUrlWithParams,
  getDataSourceId,
  getEmbeddingModelDimensions,
  parseModelInputs,
  parseModelOutputs,
} from '../../../utils/utils';
import { QuickConfigureOptionalFields } from './quick_configure_optional_fields';
import { ModelField, TextField } from '../../workflow_detail/component_input';

interface QuickConfigureModalProps {
  workflow: Workflow;
  onClose(): void;
}

// Modal to handle workflow creation. Includes a static field to set the workflow name,
// any required models, and an optional set of quick-configure fields, that when populated,
// help pre-populate some of the detailed workflow configuration.
export function QuickConfigureModal(props: QuickConfigureModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const history = useHistory();
  const { models, connectors } = useSelector((state: AppState) => state.ml);
  const { workflows } = useSelector((state: AppState) => state.workflows);

  // is creating state
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // The set of both req'd and optional fields
  const [quickConfigureFields, setQuickConfigureFields] = useState<
    QuickConfigureFields
  >({});

  // sub-form values/schema. dependent on the workflow type.
  // certain types require different subsets of models.
  const [tempErrors, setTempErrors] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<{}>({});
  const [formSchemaObj, setFormSchemaObj] = useState<{}>({});
  useEffect(() => {
    const workflowType = props.workflow?.ui_metadata?.type;
    // All workflows require a unique name, and optional description.
    let tempFormValues = {
      name: getInitialValue('string'),
      description: getInitialValue('string'),
    } as {};
    let tempFormSchemaObj = {
      name: yup
        .string()
        .test('workflowName', WORKFLOW_NAME_RESTRICTIONS, (name) => {
          return !(
            name === undefined ||
            name === '' ||
            name.length > 100 ||
            WORKFLOW_NAME_REGEXP.test(name) === false
          );
        })
        .test(
          'workflowName',
          'This workflow name is already in use. Use a different name',
          (name) => {
            return !(
              Object.values(workflows || {})
                .map((workflow) => workflow.name)
                .includes(name || '') && name !== props.workflow?.name
            );
          }
        )
        .required('Required') as yup.Schema,
      description: yup
        .string()
        .min(0)
        .max(MAX_DESCRIPTION_LENGTH, 'Too long')
        .optional() as yup.Schema,
    } as {};

    // If not custom/blank, we will have more req'd form fields for the users to supply
    if (workflowType !== WORKFLOW_TYPE.CUSTOM) {
      // if a RAG workflow, require an LLM
      if (isRAGUseCase(workflowType)) {
        tempFormValues = {
          ...tempFormValues,
          llm: getInitialValue('model'),
        };
        tempFormSchemaObj = {
          ...tempFormSchemaObj,
          llm: yup.object({
            id: yup
              .string()
              .trim()
              .min(1, 'Too short')
              .max(MAX_STRING_LENGTH, 'Too long')
              .required('Required'),
          }),
        };
      }
      tempFormValues = {
        ...tempFormValues,
        embeddingModel: getInitialValue('model'),
      };
      tempFormSchemaObj = {
        ...tempFormSchemaObj,
        embeddingModel: yup.object({
          id: yup
            .string()
            .trim()
            .min(1, 'Too short')
            .max(MAX_STRING_LENGTH, 'Too long')
            .required('Required'),
        }),
      };
    }
    setFormValues(tempFormValues);
    setFormSchemaObj(tempFormSchemaObj);
  }, [props.workflow?.ui_metadata?.type]);

  // model interface states, used for pre-populating some of the downstream ML processor configs
  const [embeddingModelInterface, setEmbeddingModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);
  const [llmInterface, setLLMInterface] = useState<ModelInterface | undefined>(
    undefined
  );
  useEffect(() => {
    setEmbeddingModelInterface(
      models[quickConfigureFields?.embeddingModelId || '']?.interface
    );
  }, [models, quickConfigureFields?.embeddingModelId]);
  useEffect(() => {
    setLLMInterface(models[quickConfigureFields?.llmId || '']?.interface);
  }, [models, quickConfigureFields?.llmId]);

  // Deployed models state
  const [deployedModels, setDeployedModels] = useState<Model[]>([]);
  useEffect(() => {
    if (models) {
      setDeployedModels(
        Object.values(models || {}).filter(
          (model) => model.state === MODEL_STATE.DEPLOYED
        )
      );
    }
  }, [models]);

  // Try to pre-fill the dimensions if an embedding model is selected
  const [unknownEmbeddingLength, setUnknownEmbeddingLength] = useState<boolean>(
    false
  );
  useEffect(() => {
    const selectedModel = deployedModels.find(
      (model) => model.id === quickConfigureFields?.embeddingModelId
    );
    if (selectedModel?.connectorId !== undefined) {
      const connector = connectors[selectedModel.connectorId];
      if (connector !== undefined) {
        const dimensions = getEmbeddingModelDimensions(connector);
        // dimensions may be undefined. set state vars accordingly
        setUnknownEmbeddingLength(dimensions === undefined);
        setQuickConfigureFields({
          ...quickConfigureFields,
          embeddingLength: dimensions,
        });
      }
    }
  }, [quickConfigureFields?.embeddingModelId, deployedModels, connectors]);

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formValues}
      validationSchema={yup.object(formSchemaObj)}
      onSubmit={(values) => {}}
      validate={(values) => {}}
    >
      {(formikProps) => {
        // update tempErrors if errors detected
        useEffect(() => {
          setTempErrors(!isEmpty(formikProps.errors));
        }, [formikProps.errors]);

        return (
          <EuiModal onClose={() => props.onClose()} style={{ width: '40vw' }}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <p>{`Quick configure`}</p>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFlexGroup direction="column" gutterSize="s">
                <EuiFlexItem>
                  <TextField
                    label="Name"
                    fullWidth={true}
                    fieldPath={`name`}
                    showError={true}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <TextField
                    label="Description - optional"
                    fullWidth={true}
                    fieldPath={`description`}
                    showError={true}
                    placeholder="Provide a description for this workflow."
                    textArea={true}
                  />
                </EuiFlexItem>
                {props.workflow?.ui_metadata?.type !== WORKFLOW_TYPE.CUSTOM &&
                  isEmpty(deployedModels) && (
                    <EuiFlexItem>
                      <EuiCallOut
                        color="warning"
                        iconType={'alert'}
                        size="s"
                        title={
                          <EuiText size="s">
                            Preset unavailable. You have no models registered in
                            your cluster.{' '}
                            <EuiLink
                              href={ML_REMOTE_MODEL_LINK}
                              target="_blank"
                            >
                              Learn more
                            </EuiLink>{' '}
                            about integrating ML models.
                          </EuiText>
                        }
                      />
                    </EuiFlexItem>
                  )}
                {isRAGUseCase(props.workflow?.ui_metadata?.type) && (
                  <EuiFlexItem>
                    <ModelField
                      modelCategory={MODEL_CATEGORY.LLM}
                      fieldPath="llm"
                      showMissingInterfaceCallout={true}
                      hasModelInterface={
                        !isEmpty(
                          models[getIn(formikProps.values, 'llm.id')]?.interface
                        )
                      }
                      label="Large language model"
                      helpText="The large language model to generate user-friendly responses."
                      fullWidth={true}
                      showError={true}
                      onModelChange={(modelId) =>
                        setQuickConfigureFields({
                          ...quickConfigureFields,
                          llmId: modelId,
                        })
                      }
                    />
                  </EuiFlexItem>
                )}
                {props.workflow?.ui_metadata?.type !== WORKFLOW_TYPE.CUSTOM &&
                  !isEmpty(deployedModels) && (
                    <EuiFlexItem>
                      <>
                        {unknownEmbeddingLength && (
                          <>
                            <EuiCallOut
                              size="s"
                              title="No embedding length found. Make sure to manually configure below."
                              color="warning"
                            />
                            <EuiSpacer size="s" />
                          </>
                        )}
                        {props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS ? (
                      <ModelField
                        modelCategory={MODEL_CATEGORY.SPARSE_ENCODER}
                        fieldPath="embeddingModel"
                        showMissingInterfaceCallout={true}
                        hasModelInterface={
                            !isEmpty(
                              models[
                                getIn(formikProps.values, 'embeddingModel.id')
                              ]?.interface
                            )
                          }
                        label="Sparse encoder"
                        helpText="The model to generate sparse vector."
                        fullWidth={true}
                        showError={true}
                        onModelChange={(modelId) =>
                          setQuickConfigureFields({
                            ...quickConfigureFields,
                            embeddingModelId: modelId,
                          })
                        }
                      />
                    ) : (
                      <ModelField
                        modelCategory={MODEL_CATEGORY.EMBEDDING}
                        fieldPath="embeddingModel"
                        showMissingInterfaceCallout={true}
                        hasModelInterface={
                          !isEmpty(
                            models[
                              getIn(formikProps.values, 'embeddingModel.id')
                            ]?.interface
                          )
                        }
                      label="Embedding model"
                      helpText="The model to generate embeddings."
                      fullWidth={true}
                      showError={true}
                      onModelChange={(modelId) =>
                        setQuickConfigureFields({
                          ...quickConfigureFields,
                          embeddingModelId: modelId,
                        })
                      }
                    />
                    )}
                  </>
                </EuiFlexItem>
              )}
              </EuiFlexGroup>
              {props.workflow?.ui_metadata?.type !== WORKFLOW_TYPE.CUSTOM && (
                <>
                  <EuiSpacer size="m" />
                  <QuickConfigureOptionalFields
                    workflowType={props.workflow.ui_metadata?.type}
                    fields={quickConfigureFields}
                    setFields={setQuickConfigureFields}
                  />
                </>
              )}
            </EuiModalBody>
            <EuiModalFooter>
              <EuiSmallButtonEmpty
                onClick={() => props.onClose()}
                data-testid="quickConfigureCancelButton"
              >
                Cancel
              </EuiSmallButtonEmpty>
              <EuiSmallButton
                disabled={tempErrors || isCreating}
                isLoading={isCreating}
                onClick={() => {
                  formikProps.submitForm().then(() => {
                    formikProps.validateForm().then((resp) => {
                      if (isEmpty(resp)) {
                        setIsCreating(true);
                        let workflowToCreate = {
                          ...props.workflow,
                          name: getIn(formikProps.values, 'name'),
                          description: getIn(formikProps.values, 'description'),
                        } as Workflow;
                        if (!isEmpty(quickConfigureFields)) {
                          workflowToCreate = injectQuickConfigureFields(
                            workflowToCreate,
                            quickConfigureFields,
                            embeddingModelInterface,
                            llmInterface
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
                      }
                    });
                  });
                }}
                data-testid="quickConfigureCreateButton"
                fill={true}
                color="primary"
              >
                Create
              </EuiSmallButton>
            </EuiModalFooter>
          </EuiModal>
        );
      }}
    </Formik>
  );
}

// helper fn to populate UI config values if there are some quick configure fields available
function injectQuickConfigureFields(
  workflow: Workflow,
  quickConfigureFields: QuickConfigureFields,
  embeddingModelInterface: ModelInterface | undefined,
  llmInterface: ModelInterface | undefined
): Workflow {
  if (workflow.ui_metadata?.type) {
    switch (workflow.ui_metadata?.type) {
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.HYBRID_SEARCH:
      case WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS:
      case WORKFLOW_TYPE.MULTIMODAL_SEARCH: {
        if (!isEmpty(quickConfigureFields) && workflow.ui_metadata?.config) {
          workflow.ui_metadata.config = updateIngestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            embeddingModelInterface,
            isVectorSearchUseCase(workflow?.ui_metadata?.type)
          );
          workflow.ui_metadata.config = updateIndexConfig(
            workflow.ui_metadata.config,
            workflow.ui_metadata?.type,
            quickConfigureFields
          );
          workflow.ui_metadata.config.search.request.value = injectPlaceholderValues(
            (workflow.ui_metadata.config.search.request.value || '') as string,
            quickConfigureFields
          );
          workflow.ui_metadata.config = updateSearchRequestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            embeddingModelInterface,
            isVectorSearchUseCase(workflow?.ui_metadata?.type)
          );
        }
        break;
      }
      case WORKFLOW_TYPE.VECTOR_SEARCH_WITH_RAG:
      case WORKFLOW_TYPE.HYBRID_SEARCH_WITH_RAG: {
        if (!isEmpty(quickConfigureFields) && workflow.ui_metadata?.config) {
          workflow.ui_metadata.config = updateIngestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            embeddingModelInterface,
            isVectorSearchUseCase(workflow?.ui_metadata?.type)
          );
          workflow.ui_metadata.config = updateIndexConfig(
            workflow.ui_metadata.config,
            workflow.ui_metadata?.type,
            quickConfigureFields
          );
          workflow.ui_metadata.config.search.request.value = injectPlaceholderValues(
            (workflow.ui_metadata.config.search.request.value || '') as string,
            quickConfigureFields
          );
          workflow.ui_metadata.config = updateSearchRequestProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            embeddingModelInterface,
            isVectorSearchUseCase(workflow?.ui_metadata?.type)
          );
          workflow.ui_metadata.config = updateRAGSearchResponseProcessors(
            workflow.ui_metadata.config,
            quickConfigureFields,
            llmInterface
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
  embeddingModelInterface: ModelInterface | undefined,
  isVectorSearchUseCase: boolean
): WorkflowConfig {
  config.ingest.enrich.processors.forEach((processor, idx) => {
    // prefill ML inference
    if (processor.type === PROCESSOR_TYPE.ML) {
      config.ingest.enrich.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.embeddingModelId) {
          field.value = { id: fields.embeddingModelId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateInputMapFromModelInputs(
            embeddingModelInterface
          );
          if (fields.textField) {
            if (inputMap.length > 0) {
              inputMap[0] = {
                ...inputMap[0],
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.textField,
                },
              };
            } else {
              inputMap.push({
                key: '',
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.textField,
                },
              });
            }
          }
          if (fields.imageField) {
            if (inputMap.length > 1) {
              inputMap[1] = {
                ...inputMap[1],
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.imageField,
                },
              };
            } else {
              inputMap.push({
                key: '',
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.imageField,
                },
              });
            }
          }
          field.value = [inputMap] as InputMapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateOutputMapFromModelOutputs(
            embeddingModelInterface
          );
          const defaultField = isVectorSearchUseCase
            ? fields.vectorField
            : fields.labelField;
          if (defaultField) {
            if (outputMap.length > 0) {
              outputMap[0] = {
                ...outputMap[0],
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: defaultField,
                },
              };
            } else {
              outputMap.push({
                key: '',
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: defaultField,
                },
              });
            }
          }
          field.value = [outputMap] as OutputMapArrayFormValue;
        }
      });
    } else if (processor.type === PROCESSOR_TYPE.TEXT_EMBEDDING) {
      config.ingest.enrich.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.embeddingModelId) {
          field.value = { id: fields.embeddingModelId };
        }
        if (field.id === 'field_map') {
          field.value = [
            {
              key: fields.textField || '',
              value: fields.vectorField || '',
            },
          ] as MapFormValue;
        }
      });
    } else if (processor.type === PROCESSOR_TYPE.TEXT_IMAGE_EMBEDDING) {
      config.ingest.enrich.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.embeddingModelId) {
          field.value = { id: fields.embeddingModelId };
        }
        if (field.id === 'field_map') {
          field.value = [
            {
              key: 'text',
              value: fields.textField || '',
            },
            {
              key: 'image',
              value: fields.imageField || '',
            },
          ] as MapFormValue;
        }
        if (field.id === 'embedding') {
          field.value = fields.vectorField || '';
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
  embeddingModelInterface: ModelInterface | undefined,
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
        if (field.id === 'model' && fields.embeddingModelId) {
          field.value = { id: fields.embeddingModelId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateInputMapFromModelInputs(
            embeddingModelInterface
          );
          if (inputMap.length > 0) {
            inputMap[0] = {
              ...inputMap[0],
              value: {
                transformType: TRANSFORM_TYPE.FIELD,
                value: defaultQueryValue,
              },
            };
          } else {
            inputMap.push({
              key: '',
              value: {
                transformType: TRANSFORM_TYPE.FIELD,
                value: defaultQueryValue,
              },
            });
          }
          field.value = [inputMap] as InputMapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateOutputMapFromModelOutputs(
            embeddingModelInterface
          );
          const defaultValue = isVectorSearchUseCase
            ? VECTOR
            : defaultQueryValue;
          if (outputMap.length > 0) {
            outputMap[0] = {
              ...outputMap[0],
              value: {
                transformType: TRANSFORM_TYPE.FIELD,
                value: defaultValue,
              },
            };
          } else {
            outputMap.push({
              key: '',
              value: {
                transformType: TRANSFORM_TYPE.FIELD,
                value: defaultValue,
              },
            });
          }
          field.value = [outputMap] as OutputMapArrayFormValue;
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

// prefill response processor configs for RAG use cases
function updateRAGSearchResponseProcessors(
  config: WorkflowConfig,
  fields: QuickConfigureFields,
  llmInterface: ModelInterface | undefined
): WorkflowConfig {
  config.search.enrichResponse.processors.forEach((processor, idx) => {
    // prefill ML inference
    if (processor.type === PROCESSOR_TYPE.ML) {
      config.search.enrichResponse.processors[idx].fields.forEach((field) => {
        if (field.id === 'model' && fields.llmId) {
          field.value = { id: fields.llmId };
        }
        if (field.id === 'input_map') {
          const inputMap = generateInputMapFromModelInputs(llmInterface);
          if (fields.promptField && fields.textField) {
            if (inputMap.length > 0) {
              inputMap[0] = {
                ...inputMap[0],
                value: {
                  transformType: TRANSFORM_TYPE.TEMPLATE,
                  value: CLAUDE_SUMMARIZE_PROMPT,
                  nestedVars: [
                    {
                      name: DEFAULT_PROMPT_RESULTS_FIELD,
                      transform: fields.textField,
                    },
                  ],
                },
              };
            } else {
              inputMap.push({
                key: '',
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: '',
                },
              });
            }
          }
          field.value = [inputMap] as InputMapArrayFormValue;
        }
        if (field.id === 'output_map') {
          const outputMap = generateOutputMapFromModelOutputs(llmInterface);
          if (fields.llmResponseField) {
            if (outputMap.length > 0) {
              outputMap[0] = {
                ...outputMap[0],
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.llmResponseField,
                },
              };
            } else {
              outputMap.push({
                key: '',
                value: {
                  transformType: TRANSFORM_TYPE.FIELD,
                  value: fields.llmResponseField,
                },
              });
            }
          }
          field.value = [outputMap] as OutputMapArrayFormValue;
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
  workflow_type: WORKFLOW_TYPE,
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
      properties[fields.vectorField] = 
        workflow_type !== WORKFLOW_TYPE.SEMANTIC_SEARCH_USING_SPARSE_ENCODERS
          ? { type: 'knn_vector', dimension: fields.embeddingLength || '' }
          : { type: 'rank_features' };
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
  if (fields.embeddingModelId) {
    finalRequestString = finalRequestString.replace(
      new RegExp(MODEL_ID_PATTERN, 'g'),
      fields.embeddingModelId
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
function generateInputMapFromModelInputs(
  modelInterface?: ModelInterface
): InputMapFormValue {
  const inputMap = [] as InputMapFormValue;
  if (modelInterface) {
    const modelInputs = parseModelInputs(modelInterface);
    modelInputs.forEach((modelInput) => {
      inputMap.push({
        ...EMPTY_INPUT_MAP_ENTRY,
        key: modelInput.label,
      });
    });
  }
  return inputMap;
}

// generate a set of mappings s.t. each key is
// a unique model output.
function generateOutputMapFromModelOutputs(
  modelInterface?: ModelInterface
): OutputMapFormValue {
  const outputMap = [] as OutputMapFormValue;
  if (modelInterface) {
    const modelOutputs = parseModelOutputs(modelInterface);
    modelOutputs.forEach((modelOutput) => {
      outputMap.push({
        ...EMPTY_OUTPUT_MAP_ENTRY,
        key: modelOutput.label,
      });
    });
  }
  return outputMap;
}
