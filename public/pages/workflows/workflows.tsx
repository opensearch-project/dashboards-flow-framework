/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import { escape, isEmpty } from 'lodash';
import {
  EuiPageHeader,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiFlexGroup,
  EuiSmallButton,
  EuiText,
  EuiFlexItem,
  EuiEmptyPrompt,
  EuiButton,
  EuiLink,
} from '@elastic/eui';
import queryString from 'query-string';
import { useSelector } from 'react-redux';
import {
  BREADCRUMBS,
  USE_NEW_HOME_PAGE,
  getAppBasePath,
} from '../../utils/constants';
import { getApplication, getCore, getNavigationUI } from '../../services';
import { WorkflowList } from './workflow_list';
import { NewWorkflow } from './new_workflow';
import {
  AppState,
  searchModels,
  searchWorkflows,
  useAppDispatch,
} from '../../store';
import { EmptyListMessage } from './empty_list_message';
import {
  FETCH_ALL_QUERY_LARGE,
  MAIN_PLUGIN_DOC_LINK,
  OPENSEARCH_FLOW,
  PLUGIN_NAME,
} from '../../../common';
import { ImportWorkflowModal } from './import_workflow';
import { MountPoint } from '../../../../../src/core/public';
import { DataSourceSelectableConfig } from '../../../../../src/plugins/data_source_management/public';
import {
  dataSourceFilterFn,
  getDataSourceFromURL,
  isDataSourceReady,
  useDataSourceVersion,
} from '../../utils/utils';
import {
  getDataSourceManagementPlugin,
  getDataSourceEnabled,
  getNotifications,
  getSavedObjectsClient,
} from '../../services';
import { prettifyErrorMessage } from '../../../common/utils';
import { DataSourceOption } from '../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import { GetStartedAccordion } from './get_started_accordion';

export interface WorkflowsRouterProps {}

interface WorkflowsProps extends RouteComponentProps<WorkflowsRouterProps> {
  setActionMenu: (menuMount: MountPoint | undefined) => void;
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
  const [dataSourceId, setDataSourceId] = useState<string | undefined>(
    queryParams.dataSourceId
  );
  const dataSourceVersion = useDataSourceVersion(dataSourceId);
  const { workflows, loading } = useSelector(
    (state: AppState) => state.workflows
  );

  // run health checks on FF and ML commons, any time there is a new selected datasource (or none if MDS is disabled)
  // block all user actions if there are failures executing the basic search APIs for either plugin.
  const [
    flowFrameworkConnectionErrors,
    setFlowFrameworkConnectionErrors,
  ] = useState<boolean>(false);
  const [mlCommonsConnectionErrors, setMLCommonsConnectionErrors] = useState<
    boolean
  >(false);
  const connectionErrors =
    flowFrameworkConnectionErrors || mlCommonsConnectionErrors;
  useEffect(() => {
    async function flowFrameworkHealthCheck() {
      await dispatch(
        searchWorkflows({
          apiBody: FETCH_ALL_QUERY_LARGE,
          dataSourceId,
        })
      ).then((resp: any) => {
        setFlowFrameworkConnectionErrors(!isEmpty(resp.error));
      });
    }
    async function mlCommonsHealthCheck() {
      await dispatch(
        searchModels({
          apiBody: FETCH_ALL_QUERY_LARGE,
          dataSourceId,
        })
      ).then((resp: any) => {
        setMLCommonsConnectionErrors(!isEmpty(resp.error));
      });
    }
    flowFrameworkHealthCheck();
    mlCommonsHealthCheck();
  }, [dataSourceId]);

  const noWorkflows = Object.keys(workflows || {}).length === 0 && !loading;

  const {
    chrome: { setBreadcrumbs },
  } = getCore();
  const { HeaderControl } = getNavigationUI();
  const { setAppDescriptionControls } = getApplication();

  // import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // tab state
  const tabFromUrl = queryString.parse(useLocation().search)[
    ACTIVE_TAB_PARAM
  ] as WORKFLOWS_TAB;
  const [selectedTabId, setSelectedTabId] = useState<WORKFLOWS_TAB>(
    escape(tabFromUrl) as WORKFLOWS_TAB
  );

  // If there is no selected tab or invalid tab, default to manage tab
  useEffect(() => {
    if (
      !selectedTabId ||
      !Object.values(WORKFLOWS_TAB).includes(selectedTabId)
    ) {
      setSelectedTabId(WORKFLOWS_TAB.MANAGE);
      replaceActiveTab(WORKFLOWS_TAB.MANAGE, props, dataSourceId);
    }
  }, [selectedTabId, workflows]);

  // If the user navigates back to the manage tab, re-fetch workflows
  useEffect(() => {
    if (selectedTabId === WORKFLOWS_TAB.MANAGE) {
      // wait until selected data source is ready before doing dispatch calls if mds is enabled
      if (isDataSourceReady(dataSourceId)) {
        dispatch(
          searchWorkflows({
            apiBody: FETCH_ALL_QUERY_LARGE,
            dataSourceId,
          })
        );
      }
    }
  }, [selectedTabId, dataSourceId, dataSourceEnabled]);

  useEffect(() => {
    setBreadcrumbs(
      USE_NEW_HOME_PAGE
        ? [BREADCRUMBS.TITLE]
        : [
            BREADCRUMBS.PLUGIN_NAME,
            BREADCRUMBS.WORKFLOWS(dataSourceEnabled ? dataSourceId : undefined),
          ]
    );
  });

  // On initial render: fetch all workflows
  useEffect(() => {
    // wait until selected data source is ready before doing dispatch calls if mds is enabled
    if (isDataSourceReady(dataSourceId)) {
      dispatch(
        searchWorkflows({
          apiBody: FETCH_ALL_QUERY_LARGE,
          dataSourceId,
        })
      );
    }
  }, [dataSourceId, dataSourceEnabled]);

  useEffect(() => {
    const { history, location } = props;
    if (dataSourceEnabled) {
      const updatedParams = {
        dataSourceId: dataSourceId,
      };

      history.replace({
        ...location,
        search: queryString.stringify(updatedParams),
      });
    }
    // wait until selected data source is ready before doing dispatch calls if mds is enabled
    if (isDataSourceReady(dataSourceId)) {
      dispatch(
        searchWorkflows({
          apiBody: FETCH_ALL_QUERY_LARGE,
          dataSourceId,
        })
      );
    }
  }, [dataSourceId, setDataSourceId, dataSourceEnabled]);

  const handleDataSourceChange = ([event]: DataSourceOption[]) => {
    const dataSourceEventId = event?.id;
    if (dataSourceEnabled) {
      if (dataSourceEventId === undefined) {
        getNotifications().toasts.addDanger(
          prettifyErrorMessage('Unable to set data source.')
        );
      } else {
        setDataSourceId(dataSourceEventId);
      }
    }
  };

  let renderDataSourceComponent = null;
  if (dataSourceEnabled && getDataSourceManagementPlugin()) {
    const DataSourceMenu = getDataSourceManagementPlugin().ui.getDataSourceMenu<
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
              dataSourceId === undefined ? undefined : [{ id: dataSourceId }],
            savedObjects: getSavedObjectsClient(),
            notifications: getNotifications(),
            onSelectedDataSources: (dataSources) =>
              handleDataSourceChange(dataSources),
            dataSourceFilter: dataSourceFilterFn,
          }}
        />
      );
    }, [getSavedObjectsClient, getNotifications(), props.setActionMenu]);
  }

  const DESCRIPTION = `Design, prototype, and experiment with solutions using ${OPENSEARCH_FLOW}. Use the visual interface to build
  ingest and search flows, test different configurations, and deploy them to your environment.`;

  const pageTitleAndDescription = USE_NEW_HOME_PAGE ? (
    <>
      <HeaderControl
        controls={[
          {
            description: DESCRIPTION,
          },
        ]}
        setMountPoint={setAppDescriptionControls}
      />
      <GetStartedAccordion initialIsOpen={noWorkflows} />
      <EuiSpacer size="s" />
    </>
  ) : (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexGroup direction="row" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText size="m">
            <h1>{PLUGIN_NAME}</h1>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiText color="subdued">{DESCRIPTION}</EuiText>
      <EuiSpacer size="l" />
      <GetStartedAccordion initialIsOpen={noWorkflows} />
      <EuiSpacer size="s" />
    </EuiFlexGroup>
  );

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
            pageTitle={pageTitleAndDescription}
            bottomBorder={false}
          />
          {/**
           * Local cluster issues: could be due to cluster being down, permissions issues,
           * and/or missing plugins.
           */}
          {!dataSourceEnabled && connectionErrors ? (
            <EuiPageContent grow={true}>
              <EuiEmptyPrompt
                title={<h2>Error accessing cluster</h2>}
                body={
                  <p>
                    Ensure your OpenSearch cluster is available and has the Flow
                    Framework and ML Commons plugins installed.
                  </p>
                }
                actions={
                  <EuiButton color="primary" fill={false}>
                    <EuiLink target="_blank" href={MAIN_PLUGIN_DOC_LINK}>
                      See documentation
                    </EuiLink>
                  </EuiButton>
                }
              />
            </EuiPageContent>
          ) : // Remote cluster/datasource issues: datasource is down, permissions issues,
          // and/or missing plugins or features.
          dataSourceEnabled &&
            dataSourceId !== undefined &&
            connectionErrors ? (
            <EuiPageContent grow={true}>
              <EuiEmptyPrompt
                title={<h2>Incompatible data source</h2>}
                body={
                  <p>
                    Ensure the data source is available and has the latest ML
                    features.
                  </p>
                }
                actions={
                  <EuiButton
                    color="primary"
                    fill
                    href={`${getAppBasePath()}/app/management/opensearch-dashboards/dataSources`}
                  >
                    Manage data sources
                  </EuiButton>
                }
              />
            </EuiPageContent>
          ) : dataSourceEnabled && dataSourceId === undefined ? (
            <EuiPageContent grow={true}>
              <EuiEmptyPrompt
                title={<h2>Incompatible data source</h2>}
                body={
                  <p>
                    No compatible data source available. Add a compatible data
                    source.
                  </p>
                }
                actions={
                  <EuiButton
                    color="primary"
                    fill
                    href={`${getAppBasePath()}/app/management/opensearch-dashboards/dataSources`}
                  >
                    Manage data sources
                  </EuiButton>
                }
              />
            </EuiPageContent>
          ) : (
            <>
              <EuiPageHeader
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
                        dataSourceId
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
                        dataSourceId
                      );
                    },
                  },
                ]}
                bottomBorder={true}
                style={{ paddingBottom: '0px' }}
              />

              <EuiPageContent grow={false}>
                <EuiPageHeader
                  style={{ marginTop: '-8px' }}
                  pageTitle={
                    <EuiText size="s">
                      <h2>
                        {selectedTabId === WORKFLOWS_TAB.MANAGE
                          ? 'Workflows'
                          : 'Create a workflow using a template'}
                      </h2>
                    </EuiText>
                  }
                  rightSideItems={
                    selectedTabId === WORKFLOWS_TAB.MANAGE
                      ? [
                          <EuiSmallButton
                            style={{ marginTop: '8px' }}
                            fill={true}
                            onClick={() => {
                              setSelectedTabId(WORKFLOWS_TAB.CREATE);
                              replaceActiveTab(
                                WORKFLOWS_TAB.CREATE,
                                props,
                                dataSourceId
                              );
                            }}
                            iconType="plus"
                            data-testid="createWorkflowButton"
                          >
                            Create workflow
                          </EuiSmallButton>,
                          <EuiSmallButton
                            style={{ marginTop: '8px' }}
                            onClick={() => {
                              setIsImportModalOpen(true);
                            }}
                            data-testid="importWorkflowButton"
                          >
                            Import workflow
                          </EuiSmallButton>,
                        ]
                      : [
                          <EuiSmallButton
                            style={{ marginTop: '8px' }}
                            onClick={() => {
                              setIsImportModalOpen(true);
                            }}
                            data-testid="importWorkflowButton"
                          >
                            Import workflow
                          </EuiSmallButton>,
                        ]
                  }
                  bottomBorder={false}
                />
                {selectedTabId === WORKFLOWS_TAB.MANAGE ? (
                  <WorkflowList
                    setSelectedTabId={setSelectedTabId}
                    dataSourceVersion={dataSourceVersion}
                  />
                ) : (
                  <>
                    <EuiSpacer size="s" />
                    <NewWorkflow />
                  </>
                )}
                {selectedTabId === WORKFLOWS_TAB.MANAGE && noWorkflows && (
                  <EmptyListMessage
                    onClickNewWorkflow={() => {
                      setSelectedTabId(WORKFLOWS_TAB.CREATE);
                      replaceActiveTab(
                        WORKFLOWS_TAB.CREATE,
                        props,
                        dataSourceId
                      );
                    }}
                  />
                )}
              </EuiPageContent>
            </>
          )}
        </EuiPageBody>
      </EuiPage>
    </>
  );
}
