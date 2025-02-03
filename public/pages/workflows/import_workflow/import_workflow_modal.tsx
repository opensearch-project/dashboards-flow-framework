/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiSmallButtonEmpty,
  EuiSmallButton,
  EuiText,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiCompressedFilePicker,
  EuiCallOut,
  EuiFlexItem,
  EuiCompressedFieldText,
  EuiCompressedFormRow,
  EuiCompressedTextArea,
} from '@elastic/eui';
import {
  getObjFromJsonOrYamlString,
  isValidUiWorkflow,
  isValidWorkflow,
} from '../../../utils';
import { getCore } from '../../../services';
import {
  AppState,
  createWorkflow,
  searchWorkflows,
  useAppDispatch,
} from '../../../store';
import {
  FETCH_ALL_QUERY_LARGE,
  MAX_DESCRIPTION_LENGTH,
  Workflow,
  WORKFLOW_NAME_REGEXP,
  WORKFLOW_NAME_RESTRICTIONS,
} from '../../../../common';
import { WORKFLOWS_TAB } from '../workflows';
import { getDataSourceId } from '../../../utils/utils';

interface ImportWorkflowModalProps {
  isImportModalOpen: boolean;
  setIsImportModalOpen(isOpen: boolean): void;
  setSelectedTabId(tabId: WORKFLOWS_TAB): void;
}

/**
 * The import workflow modal. Allows uploading local JSON or YAML files to be uploaded, parsed, and
 * created as new workflows. Automatic validation is handled to:
 * 1/ allow upload (valid workflow with UI data),
 * 2/ warn and allow upload (valid workflow but missing/no UI data), and
 * 3/ prevent upload (invalid workflow).
 */
export function ImportWorkflowModal(props: ImportWorkflowModalProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { workflows } = useSelector((state: AppState) => state.workflows);

  // workflow name state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowNameTouched, setWorkflowNameTouched] = useState<boolean>(
    false
  );
  function isInvalidName(name: string): boolean {
    return (
      name === '' ||
      name.length > 100 ||
      WORKFLOW_NAME_REGEXP.test(name) === false ||
      workflowNameExists
    );
  }
  const workflowNameExists = Object.values(workflows || {})
    .map((workflow) => workflow.name)
    .includes(workflowName);

  // workflow description state
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  function isInvalidDescription(description: string): boolean {
    return description.length > MAX_DESCRIPTION_LENGTH;
  }

  // transient importing state for button state
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // file contents & file obj state
  const [fileContents, setFileContents] = useState<string | undefined>(
    undefined
  );
  const [fileObj, setFileObj] = useState<object | undefined>(undefined);
  useEffect(() => {
    setFileObj(getObjFromJsonOrYamlString(fileContents));
  }, [fileContents]);

  // file reader to read the file and set the fileContents var
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target) {
      setFileContents(e.target.result as string);
    }
  };

  useEffect(() => {
    if (isValidWorkflow(fileObj)) {
      const parsedWorkflow = fileObj as Workflow;
      setWorkflowNameTouched(true);
      setWorkflowName(parsedWorkflow?.name || '');
      setWorkflowDescription(parsedWorkflow?.description || '');
    }
  }, [fileObj]);

  function onModalClose(): void {
    props.setIsImportModalOpen(false);
    setFileContents(undefined);
    setFileObj(undefined);
  }

  return (
    <EuiModal onClose={() => onModalClose()} style={{ width: '60vw' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <p>{`Import a workflow (JSON/YAML)`}</p>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column" gutterSize="s">
          {fileContents !== undefined && !isValidWorkflow(fileObj) && (
            <>
              <EuiFlexItem>
                <EuiCallOut
                  title="The uploaded file is not a valid workflow, remove the file and upload a compatible workflow in JSON or YAML format."
                  iconType={'alert'}
                  color="danger"
                />
              </EuiFlexItem>
              <EuiSpacer size="m" />
            </>
          )}
          {isValidWorkflow(fileObj) && !isValidUiWorkflow(fileObj) && (
            <>
              <EuiFlexItem>
                <EuiCallOut
                  title="This project is not compatible with OpenSearch Flow. You may not be able to edit or run it."
                  iconType={'help'}
                  color="warning"
                />
              </EuiFlexItem>
              <EuiSpacer size="m" />
            </>
          )}
          <EuiFlexItem grow={false}>
            <EuiCompressedFilePicker
              fullWidth={true}
              compressed={false}
              multiple={false}
              initialPromptText="Select or drag and drop a file"
              onChange={(files) => {
                if (files && files.length > 0) {
                  fileReader.readAsText(files[0]);
                } else {
                  setFileContents(undefined);
                }
              }}
              display="large"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s" color="subdued">
              Must be in JSON or YAML format.
            </EuiText>
          </EuiFlexItem>
          {isValidWorkflow(fileObj) && (
            <>
              <EuiFlexItem grow={false}>
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Name'}
                  error={
                    workflowNameExists
                      ? 'This workflow name is already in use. Use a different name'
                      : WORKFLOW_NAME_RESTRICTIONS
                  }
                  isInvalid={workflowNameTouched && isInvalidName(workflowName)}
                >
                  <EuiCompressedFieldText
                    fullWidth={true}
                    placeholder={'Enter a name for this workflow'}
                    value={workflowName}
                    onChange={(e) => {
                      setWorkflowNameTouched(true);
                      setWorkflowName(e.target.value?.trim());
                    }}
                    onBlur={() => setWorkflowNameTouched(true)}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiCompressedFormRow
                  fullWidth={true}
                  label={'Description'}
                  error={'Too long'}
                  isInvalid={isInvalidDescription(workflowDescription)}
                >
                  <EuiCompressedTextArea
                    fullWidth={true}
                    value={workflowDescription}
                    onChange={(e) => {
                      setWorkflowDescription(e.target.value);
                    }}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>
            </>
          )}
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiSmallButtonEmpty
          onClick={() => onModalClose()}
          data-testid="cancelImportButton"
        >
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton
          disabled={
            !isValidWorkflow(fileObj) ||
            isImporting ||
            isInvalidName(workflowName) ||
            isInvalidDescription(workflowDescription)
          }
          isLoading={isImporting}
          onClick={() => {
            setIsImporting(true);
            dispatch(
              createWorkflow({
                apiBody: {
                  ...(fileObj as Workflow),
                  name: workflowName,
                  description: workflowDescription,
                },
                dataSourceId,
              })
            )
              .unwrap()
              .then((result) => {
                const { workflow } = result;
                dispatch(
                  searchWorkflows({
                    apiBody: FETCH_ALL_QUERY_LARGE,
                    dataSourceId,
                  })
                );
                props.setSelectedTabId(WORKFLOWS_TAB.MANAGE);
                getCore().notifications.toasts.addSuccess(
                  `Successfully imported ${workflow.name}`
                );
              })
              .catch((error: any) => {
                getCore().notifications.toasts.addDanger(error);
              })
              .finally(() => {
                setIsImporting(false);
                onModalClose();
              });
          }}
          data-testid="importJSONButton"
          fill={true}
          color="primary"
        >
          {isValidWorkflow(fileObj) && !isValidUiWorkflow(fileObj)
            ? 'Import anyway'
            : 'Import'}
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
