/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory, useLocation } from 'react-router-dom';
import {
  EuiPageHeader,
  EuiTitle,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiButton,
  EuiText,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiFilePicker,
  EuiCallOut,
  EuiFlexItem,
} from '@elastic/eui';
import queryString from 'query-string';
import { useSelector } from 'react-redux';
import {
  BREADCRUMBS,
  getObjFromJsonOrYamlString,
  isValidUiWorkflow,
  isValidWorkflow,
} from '../../utils';
import { getCore } from '../../services';
import { WorkflowList } from './workflow_list';
import { NewWorkflow } from './new_workflow';
import {
  AppState,
  createWorkflow,
  searchWorkflows,
  useAppDispatch,
} from '../../store';
import { EmptyListMessage } from './empty_list_message';
import { FETCH_ALL_QUERY_BODY } from '../../../common';

export interface WorkflowsRouterProps {}

interface WorkflowsProps extends RouteComponentProps<WorkflowsRouterProps> {}

export enum WORKFLOWS_TAB {
  MANAGE = 'manage',
  CREATE = 'create',
}

const ACTIVE_TAB_PARAM = 'tab';

function replaceActiveTab(activeTab: string, props: WorkflowsProps) {
  props.history.replace({
    ...history,
    search: queryString.stringify({
      [ACTIVE_TAB_PARAM]: activeTab,
    }),
  });
}

/**
 * The base workflows page. From here, users can toggle between views to access
 * existing created workflows, or explore the library of workflow templates
 * to get started on a new workflow.
 */
export function Workflows(props: WorkflowsProps) {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { workflows, loading, errorMessage } = useSelector(
    (state: AppState) => state.workflows
  );

  // import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  function onModalClose(): void {
    setIsImportModalOpen(false);
    setFileContents(undefined);
    setFileObj(undefined);
  }

  // file contents state
  const [fileContents, setFileContents] = useState<string | undefined>(
    undefined
  );
  const [fileObj, setFileObj] = useState<object | undefined>(undefined);
  useEffect(() => {
    setFileObj(getObjFromJsonOrYamlString(fileContents));
  }, [fileContents]);
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target) {
      setFileContents(e.target.result as string);
    }
  };

  // tab state
  const tabFromUrl = queryString.parse(useLocation().search)[
    ACTIVE_TAB_PARAM
  ] as WORKFLOWS_TAB;
  const [selectedTabId, setSelectedTabId] = useState<WORKFLOWS_TAB>(tabFromUrl);

  // If there is no selected tab or invalid tab, default to manage tab
  useEffect(() => {
    if (
      !selectedTabId ||
      !Object.values(WORKFLOWS_TAB).includes(selectedTabId)
    ) {
      setSelectedTabId(WORKFLOWS_TAB.MANAGE);
      replaceActiveTab(WORKFLOWS_TAB.MANAGE, props);
    }
  }, [selectedTabId, workflows]);

  // If the user navigates back to the manage tab, re-fetch workflows
  useEffect(() => {
    if (selectedTabId === WORKFLOWS_TAB.MANAGE) {
      dispatch(searchWorkflows(FETCH_ALL_QUERY_BODY));
    }
  }, [selectedTabId]);

  useEffect(() => {
    getCore().chrome.setBreadcrumbs([
      BREADCRUMBS.FLOW_FRAMEWORK,
      BREADCRUMBS.WORKFLOWS,
    ]);
  });

  // Show a toast if an error message exists in state
  useEffect(() => {
    if (errorMessage) {
      console.error(errorMessage);
      getCore().notifications.toasts.addDanger(errorMessage);
    }
  }, [errorMessage]);

  // On initial render: fetch all workflows
  useEffect(() => {
    dispatch(searchWorkflows(FETCH_ALL_QUERY_BODY));
  }, []);

  return (
    <>
      {isImportModalOpen && (
        <EuiModal onClose={() => onModalClose()} style={{ width: '40vw' }}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <p>{`Import a workflow (JSON/YAML)`}</p>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiFlexGroup
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
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
              {fileContents !== undefined &&
                fileObj !== undefined &&
                isValidWorkflow(fileObj) &&
                !isValidUiWorkflow(fileObj) && (
                  <>
                    <EuiFlexItem>
                      <EuiCallOut
                        title="The uploaded file may not be compatible with Search Studio. You may not be able to edit or run this file with Search Studio."
                        iconType={'help'}
                        color="warning"
                      />
                    </EuiFlexItem>
                    <EuiSpacer size="m" />
                  </>
                )}
              <EuiFlexItem grow={false}>
                <EuiFilePicker
                  multiple={false}
                  initialPromptText="Select or drag and drop a file"
                  onChange={(files) => {
                    if (files && files.length > 0) {
                      fileReader.readAsText(files[0]);
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
            </EuiFlexGroup>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => onModalClose()}>
              Cancel
            </EuiButtonEmpty>
            <EuiButton
              disabled={fileContents === undefined || fileObj === undefined}
              onClick={() => {
                console.log('fileobj: ', fileObj);
                // const workflowToCreate = {
                //   ...props.workflow,
                //   name: workflowName,
                // };
                // dispatch(createWorkflow(workflowToCreate))
                //   .unwrap()
                //   .then((result) => {
                //     const { workflow } = result;
                //     history.replace(APP_PATH.WORKFLOWS);
                //     history.go(0);
                //   })
                //   .catch((err: any) => {
                //     console.error(err);
                //   });
              }}
              fill={true}
              color="primary"
            >
              Import
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader
            pageTitle={
              <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
                <EuiTitle size="l">
                  <h2>Search Studio</h2>
                </EuiTitle>
                <EuiText color="subdued">
                  Design, experiment, and prototype your solutions with
                  workflows. Build your search and last mile ingestion flows.
                </EuiText>
              </EuiFlexGroup>
            }
            tabs={[
              {
                id: WORKFLOWS_TAB.MANAGE,
                label: 'Manage workflows',
                isSelected: selectedTabId === WORKFLOWS_TAB.MANAGE,
                onClick: () => {
                  setSelectedTabId(WORKFLOWS_TAB.MANAGE);
                  replaceActiveTab(WORKFLOWS_TAB.MANAGE, props);
                },
              },
              {
                id: WORKFLOWS_TAB.CREATE,
                label: 'New workflow',
                isSelected: selectedTabId === WORKFLOWS_TAB.CREATE,
                onClick: () => {
                  setSelectedTabId(WORKFLOWS_TAB.CREATE);
                  replaceActiveTab(WORKFLOWS_TAB.CREATE, props);
                },
              },
            ]}
            bottomBorder={true}
          />

          <EuiPageContent>
            <EuiPageHeader
              style={{ marginTop: '-8px' }}
              pageTitle={
                <EuiTitle size="m">
                  <h2>
                    {' '}
                    {selectedTabId === WORKFLOWS_TAB.MANAGE
                      ? 'Workflows'
                      : 'Create from a template'}
                  </h2>
                </EuiTitle>
              }
              rightSideItems={[
                <EuiButton
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    setIsImportModalOpen(true);
                  }}
                >
                  Import workflow
                </EuiButton>,
              ]}
              bottomBorder={false}
            />
            {selectedTabId === WORKFLOWS_TAB.MANAGE ? (
              <WorkflowList setSelectedTabId={setSelectedTabId} />
            ) : (
              <>
                <EuiSpacer size="m" />
                <NewWorkflow />
              </>
            )}
            {selectedTabId === WORKFLOWS_TAB.MANAGE &&
              Object.keys(workflows || {}).length === 0 &&
              !loading && (
                <EmptyListMessage
                  onClickNewWorkflow={() => {
                    setSelectedTabId(WORKFLOWS_TAB.CREATE);
                    replaceActiveTab(WORKFLOWS_TAB.CREATE, props);
                  }}
                />
              )}
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </>
  );
}
