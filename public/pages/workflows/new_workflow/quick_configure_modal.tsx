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
  QuickConfigureFields,
  WORKFLOW_NAME_REGEXP,
  WORKFLOW_TYPE,
  Workflow,
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
    <EuiModal onClose={() => props.onClose()}>
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
      // Semantic search / hybrid search: set defaults in the ingest processor and preset query
      case WORKFLOW_TYPE.SEMANTIC_SEARCH:
      case WORKFLOW_TYPE.HYBRID_SEARCH: {
        if (
          !isEmpty(quickConfigureFields.embeddingModelId) &&
          typeof quickConfigureFields.embeddingModelId === 'string'
        ) {
          console.log('entering injection');
          workflow = updateIngestProcessorConfig(
            workflow,
            quickConfigureFields.embeddingModelId
          );
          workflow = updateSearchRequestConfig(
            workflow,
            quickConfigureFields.embeddingModelId
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

// given a model ID, update the ML processor config
function updateIngestProcessorConfig(
  workflow: Workflow,
  modelId: string
): Workflow {
  if (workflow.ui_metadata?.config) {
    workflow.ui_metadata.config.ingest.enrich.processors[0].fields.forEach(
      (field) => {
        if (field.id === 'model') {
          field.value = { id: modelId };
        }
      }
    );
  }
  return workflow;
}

// given a model ID, replace placeholders in the preset query
function updateSearchRequestConfig(
  workflow: Workflow,
  modelId: string
): Workflow {
  if (workflow.ui_metadata?.config) {
    workflow.ui_metadata.config.search.request.value = ((workflow.ui_metadata
      .config.search.request.value || '') as string).replace(
      MODEL_ID_PATTERN,
      modelId
    );
  }
  return workflow;
}
