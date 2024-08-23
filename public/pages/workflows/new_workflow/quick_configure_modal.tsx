/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  MODEL_ID_PATTERN,
  MapArrayFormValue,
  QuickConfigureFields,
  TEXT_FIELD_PATTERN,
  VECTOR_FIELD_PATTERN,
  WORKFLOW_NAME_REGEXP,
  WORKFLOW_TYPE,
  Workflow,
  WorkflowConfig,
  customStringify,
} from '../../../../common';
import { APP_PATH } from '../../../utils';
import { processWorkflowName } from './utils';
import { createWorkflow, useAppDispatch } from '../../../store';
import { constructUrlWithParams, getDataSourceId } from '../../../utils/utils';
import { QuickConfigureInputs } from './quick_configure_inputs';
import { isEmpty } from 'lodash';

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
                quickConfigureFields
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
  quickConfigureFields: QuickConfigureFields
): Workflow {
  if (workflow.ui_metadata?.type) {
    switch (workflow.ui_metadata?.type) {
      // Semantic search / hybrid search: set defaults in the ingest processor, the index mappings,
      // and the preset query
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.HYBRID_SEARCH: {
        if (!isEmpty(quickConfigureFields) && workflow.ui_metadata?.config) {
          workflow.ui_metadata.config = updateIngestProcessorConfig(
            workflow.ui_metadata.config,
            quickConfigureFields
          );
          workflow.ui_metadata.config = updateIndexConfig(
            workflow.ui_metadata.config,
            quickConfigureFields
          );
          workflow.ui_metadata.config = updateSearchRequestConfig(
            workflow.ui_metadata.config,
            quickConfigureFields
          );
        }
      }
      case WORKFLOW_TYPE.CUSTOM:
      case undefined:
      default:
        break;
    }
  }
  return workflow;
}

// prefill ML ingest pipeline processor config, if applicable
function updateIngestProcessorConfig(
  config: WorkflowConfig,
  fields: QuickConfigureFields
): WorkflowConfig {
  config.ingest.enrich.processors[0].fields.forEach((field) => {
    if (field.id === 'model' && fields.embeddingModelId) {
      field.value = { id: fields.embeddingModelId };
    }
    if (field.id === 'input_map' && fields.textField) {
      field.value = [
        [{ key: '', value: fields.textField }],
      ] as MapArrayFormValue;
    }
    if (field.id === 'output_map' && fields.vectorField) {
      field.value = [
        [{ key: fields.vectorField, value: '' }],
      ] as MapArrayFormValue;
    }
  });

  return config;
}

// prefill index mappings/settings, if applicable
function updateIndexConfig(
  config: WorkflowConfig,
  fields: QuickConfigureFields
): WorkflowConfig {
  if (fields.textField) {
    const existingMappings = JSON.parse(
      config.ingest.index.mappings.value as string
    );
    config.ingest.index.mappings.value = customStringify({
      ...existingMappings,
      properties: {
        ...(existingMappings.properties || {}),
        [fields.textField]: {
          type: 'text',
        },
      },
    });
  }
  if (fields.vectorField) {
    const existingMappings = JSON.parse(
      config.ingest.index.mappings.value as string
    );
    config.ingest.index.mappings.value = customStringify({
      ...existingMappings,
      properties: {
        ...(existingMappings.properties || {}),
        [fields.vectorField]: {
          type: 'knn_vector',
          dimension: fields.embeddingLength || '',
        },
      },
    });
  }
  return config;
}

// pre-populate placeholders in the query, if applicable
function updateSearchRequestConfig(
  config: WorkflowConfig,
  fields: QuickConfigureFields
): WorkflowConfig {
  if (fields.embeddingModelId) {
    config.search.request.value = ((config.search.request.value ||
      '') as string).replace(
      new RegExp(MODEL_ID_PATTERN, 'g'),
      fields.embeddingModelId
    );
  }
  if (fields.textField) {
    config.search.request.value = ((config.search.request.value ||
      '') as string).replace(
      new RegExp(TEXT_FIELD_PATTERN, 'g'),
      fields.textField
    );
  }
  if (fields.vectorField) {
    config.search.request.value = ((config.search.request.value ||
      '') as string).replace(
      new RegExp(VECTOR_FIELD_PATTERN, 'g'),
      fields.vectorField
    );
  }

  return config;
}
