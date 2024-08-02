/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import {
  EuiPageHeader,
  EuiTitle,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiFlexGroup,
  EuiButton,
  EuiText,
} from '@elastic/eui';
import queryString from 'query-string';
import { useSelector } from 'react-redux';
import { BREADCRUMBS, MDS_BREADCRUMBS } from '../../utils';
import { getCore } from '../../services';
import { WorkflowList } from './workflow_list';
import { NewWorkflow } from './new_workflow';
import { AppState, searchWorkflows, useAppDispatch } from '../../store';
import { EmptyListMessage } from './empty_list_message';
import { FETCH_ALL_QUERY_BODY } from '../../../common';
import { ImportWorkflowModal } from './import_workflow';
import { MountPoint } from '../../../../../src/core/public';
import { DataSourceSelectableConfig } from '../../../../../src/plugins/data_source_management/public';

import { getDataSourceFromURL } from '../../utils/utils';

import {
  getDataSourceManagementPlugin,
  getDataSourceEnabled,
  getNotifications,
  getSavedObjectsClient,
} from '../../services';

import { MDSStates } from '../../../common/interfaces';
import { prettifyErrorMessage } from '../../../common/utils';

export interface WorkflowsRouterProps {}

interface WorkflowsProps extends RouteComponentProps<WorkflowsRouterProps> {
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  landingDataSourceId?: string;
}

export enum WORKFLOWS_TAB {
  MANAGE = 'manage',
  CREATE = 'create',
}

const ACTIVE_TAB_PARAM = 'tab';

function replaceActiveTab(
  activeTab: string,
  props: WorkflowsProps,
  dataSourceId?: string
) {
  props.history.replace({
    ...history,
    search: queryString.stringify({
      [ACTIVE_TAB_PARAM]: activeTab,
      dataSourceId,
    }),
  });
}

/**
 * The base workflows page. From here, users can toggle between views to access
 * existing created workflows, explore the library of workflow templates
 * to get started on a new workflow, or import local workflow templates.
 */
export function Workflows(props: WorkflowsProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const queryParams = getDataSourceFromURL(location);
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const [MDSOverviewState, setMDSOverviewState] = useState<MDSStates>({
    queryParams,
    selectedDataSourceId: queryParams.dataSourceId,
  });
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

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
      replaceActiveTab(
        WORKFLOWS_TAB.MANAGE,
        props,
        MDSOverviewState.selectedDataSourceId
      );
    }
  }, [selectedTabId, workflows]);

  // If the user navigates back to the manage tab, re-fetch workflows
  useEffect(() => {
    if (selectedTabId === WORKFLOWS_TAB.MANAGE) {
      dispatch(
        searchWorkflows({
          apiBody: FETCH_ALL_QUERY_BODY,
          dataSourceId: MDSOverviewState.selectedDataSourceId,
        })
      );
    }
  }, [selectedTabId]);

  useEffect(() => {
    if (dataSourceEnabled) {
      getCore().chrome.setBreadcrumbs([
        MDS_BREADCRUMBS.FLOW_FRAMEWORK,
        MDS_BREADCRUMBS.WORKFLOWS(MDSOverviewState.selectedDataSourceId),
      ]);
    } else {
      getCore().chrome.setBreadcrumbs([
        BREADCRUMBS.FLOW_FRAMEWORK,
        BREADCRUMBS.WORKFLOWS,
      ]);
    }
  });

  // On initial render: fetch all workflows
  useEffect(() => {
    dispatch(
      searchWorkflows({
        apiBody: FETCH_ALL_QUERY_BODY,
        dataSourceId: MDSOverviewState.selectedDataSourceId,
      })
    );
  }, []);

  useEffect(() => {
    const { history, location } = props;
    if (dataSourceEnabled) {
      const updatedParams = {
        dataSourceId: MDSOverviewState.selectedDataSourceId,
      };

      history.replace({
        ...location,
        search: queryString.stringify(updatedParams),
      });
    }
    dispatch(
      searchWorkflows({
        apiBody: FETCH_ALL_QUERY_BODY,
        dataSourceId: MDSOverviewState.selectedDataSourceId,
      })
    );
  }, [MDSOverviewState]);

  const handleDataSourceChange = ([event]) => {
    const dataSourceId = event?.id;
    if (dataSourceEnabled) {
      if (dataSourceId === undefined) {
        getNotifications().toasts.addDanger(
          prettifyErrorMessage('Unable to set data source.')
        );
      } else {
        setMDSOverviewState({
          queryParams: dataSourceId,
          selectedDataSourceId: dataSourceId,
        });
      }
    }
  };

  let renderDataSourceComponent = null;
  if (dataSourceEnabled) {
    const DataSourceMenu = getDataSourceManagementPlugin()?.ui.getDataSourceMenu<
      DataSourceSelectableConfig
    >();
    renderDataSourceComponent = useMemo(() => {
      return (
        <DataSourceMenu
          setMenuMountPoint={props.setActionMenu}
          componentType={'DataSourceSelectable'}
          componentConfig={{
            fullWidth: false,
            activeOption:
              props.landingDataSourceId === undefined ||
              MDSOverviewState.selectedDataSourceId === undefined
                ? undefined
                : [{ id: MDSOverviewState.selectedDataSourceId }],
            savedObjects: getSavedObjectsClient(),
            notifications: getNotifications(),
            onSelectedDataSources: (dataSources) =>
              handleDataSourceChange(dataSources),
          }}
        />
      );
    }, [getSavedObjectsClient, getNotifications(), props.setActionMenu]);
  }

  return (
    <>
      {isImportModalOpen && (
        <ImportWorkflowModal
          isImportModalOpen={isImportModalOpen}
          setIsImportModalOpen={setIsImportModalOpen}
          setSelectedTabId={setSelectedTabId}
        />
      )}
      {dataSourceEnabled && renderDataSourceComponent}
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader
            pageTitle={
              <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
                <EuiTitle size="l">
                  <h1>Search Studio</h1>
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
                  replaceActiveTab(
                    WORKFLOWS_TAB.MANAGE,
                    props,
                    MDSOverviewState.selectedDataSourceId
                  );
                },
              },
              {
                id: WORKFLOWS_TAB.CREATE,
                label: 'New workflow',
                isSelected: selectedTabId === WORKFLOWS_TAB.CREATE,
                onClick: () => {
                  setSelectedTabId(WORKFLOWS_TAB.CREATE);
                  replaceActiveTab(
                    WORKFLOWS_TAB.CREATE,
                    props,
                    MDSOverviewState.selectedDataSourceId
                  );
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
                    {selectedTabId === WORKFLOWS_TAB.MANAGE
                      ? 'Workflows'
                      : 'Create from a template'}
                  </h2>
                </EuiTitle>
              }
              rightSideItems={
                selectedTabId === WORKFLOWS_TAB.MANAGE
                  ? [
                      <EuiButton
                        style={{ marginTop: '8px' }}
                        fill={true}
                        onClick={() => {
                          setSelectedTabId(WORKFLOWS_TAB.CREATE);
                        }}
                      >
                        Create workflow
                      </EuiButton>,
                      <EuiButton
                        style={{ marginTop: '8px' }}
                        onClick={() => {
                          setIsImportModalOpen(true);
                        }}
                      >
                        Import workflow
                      </EuiButton>,
                    ]
                  : [
                      <EuiButton
                        style={{ marginTop: '8px' }}
                        onClick={() => {
                          setIsImportModalOpen(true);
                        }}
                      >
                        Import workflow
                      </EuiButton>,
                    ]
              }
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
                    replaceActiveTab(
                      WORKFLOWS_TAB.CREATE,
                      props,
                      MDSOverviewState.selectedDataSourceId
                    );
                  }}
                />
              )}
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </>
  );
}
