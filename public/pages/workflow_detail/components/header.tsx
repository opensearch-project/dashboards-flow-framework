/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSmallButtonEmpty,
  EuiSmallButton,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import {
  PLUGIN_ID,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  Workflow,
  getCharacterLimitedString,
  toFormattedDate,
  WorkflowConfig,
  WorkflowTemplate,
  WorkflowFormValues,
  CONFIG_STEP,
} from '../../../../common';
import {
  APP_PATH,
  SHOW_ACTIONS_IN_HEADER,
  constructUrlWithParams,
  getDataSourceId,
  dataSourceFilterFn,
  formikToUiConfig,
} from '../../../utils';
import { ExportModal } from './export_modal';
import {
  getApplication,
  getCore,
  getDataSourceEnabled,
  getHeaderActionMenu,
  getNavigationUI,
  getNotifications,
  getSavedObjectsClient,
  getDataSourceManagementPlugin,
} from '../../../services';
import { DataSourceViewConfig } from '../../../../../../src/plugins/data_source_management/public';
import { HeaderVariant } from '../../../../../../src/core/public';
import {
  TopNavControlTextData,
  TopNavMenuData,
  TopNavMenuIconData,
} from '../../../../../../src/plugins/navigation/public';
import { MountPoint } from '../../../../../../src/core/public';
import { getWorkflow, updateWorkflow, useAppDispatch } from '../../../store';
import { useFormikContext } from 'formik';
import { isEmpty, isEqual } from 'lodash';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
  uiConfig: WorkflowConfig | undefined;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  isRunningIngest: boolean;
  isRunningSearch: boolean;
  selectedStep: CONFIG_STEP;
  unsavedIngestProcessors: boolean;
  setUnsavedIngestProcessors: (unsavedIngestProcessors: boolean) => void;
  unsavedSearchProcessors: boolean;
  setUnsavedSearchProcessors: (unsavedSearchProcessors: boolean) => void;
  setActionMenu: (menuMount?: MountPoint) => void;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { resetForm, setTouched, values, touched, dirty } = useFormikContext<
    WorkflowFormValues
  >();

  // workflow state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowLastUpdated, setWorkflowLastUpdated] = useState<string>('');

  // export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { TopNavMenu, HeaderControl } = getNavigationUI();
  const { setAppRightControls } = getApplication();
  const {
    chrome: { setHeaderVariant },
  } = getCore();

  // get some workflow details
  useEffect(() => {
    if (props.workflow) {
      setWorkflowName(
        getCharacterLimitedString(
          props.workflow.name,
          MAX_WORKFLOW_NAME_TO_DISPLAY
        )
      );
      try {
        const formattedDate = toFormattedDate(
          // @ts-ignore
          props.workflow.lastUpdated
        ).toString();
        setWorkflowLastUpdated(formattedDate);
      } catch (err) {
        setWorkflowLastUpdated('');
      }
    }
  }, [props.workflow]);

  // When NewHomePage is enabled, use 'application' HeaderVariant; otherwise, use 'page' HeaderVariant (default).
  useEffect(() => {
    if (SHOW_ACTIONS_IN_HEADER) {
      setHeaderVariant?.(HeaderVariant.APPLICATION);
    }
    return () => {
      setHeaderVariant?.();
    };
  }, [setHeaderVariant, SHOW_ACTIONS_IN_HEADER]);

  const onExportButtonClick = () => {
    setIsExportModalOpen(true);
  };

  const onExitButtonClick = () => {
    history.replace(
      constructUrlWithParams(APP_PATH.WORKFLOWS, undefined, dataSourceId)
    );
  };

  const topNavConfig: TopNavMenuData[] = [
    {
      iconType: 'exportAction',
      tooltip: 'Export',
      ariaLabel: 'Export',
      run: onExportButtonClick,
      controlType: 'icon',
    } as TopNavMenuIconData,
    {
      iconType: 'exit',
      tooltip: 'Return to projects',
      ariaLabel: 'Exit',
      run: onExitButtonClick,
      controlType: 'icon',
    } as TopNavMenuIconData,
  ];

  // get & render the data source component, if applicable
  let DataSourceComponent: ReactElement | null = null;
  if (dataSourceEnabled && getDataSourceManagementPlugin()) {
    const DataSourceMenu = getDataSourceManagementPlugin().ui.getDataSourceMenu<
      DataSourceViewConfig
    >();
    DataSourceComponent = (
      <DataSourceMenu
        setMenuMountPoint={props.setActionMenu}
        componentType={'DataSourceView'}
        componentConfig={{
          activeOption: [{ id: dataSourceId }],
          fullWidth: false,
          savedObjects: getSavedObjectsClient(),
          notifications: getNotifications(),
          dataSourceFilter: dataSourceFilterFn,
        }}
      />
    );
  }

  // transient running state
  const [isRunningSave, setIsRunningSave] = useState<boolean>(false);

  // listener when ingest processors have been added/deleted.
  // compare to the indexed/persisted workflow config
  useEffect(() => {
    props.setUnsavedIngestProcessors(
      !isEqual(
        props.uiConfig?.ingest?.enrich?.processors,
        props.workflow?.ui_metadata?.config?.ingest?.enrich?.processors
      )
    );
  }, [props.uiConfig?.ingest?.enrich?.processors?.length]);

  // listener when search processors have been added/deleted.
  // compare to the indexed/persisted workflow config
  useEffect(() => {
    props.setUnsavedSearchProcessors(
      !isEqual(
        props.uiConfig?.search?.enrichRequest?.processors,
        props.workflow?.ui_metadata?.config?.search?.enrichRequest?.processors
      ) ||
        !isEqual(
          props.uiConfig?.search?.enrichResponse?.processors,
          props.workflow?.ui_metadata?.config?.search?.enrichResponse
            ?.processors
        )
    );
  }, [
    props.uiConfig?.search?.enrichRequest?.processors?.length,
    props.uiConfig?.search?.enrichResponse?.processors?.length,
  ]);

  // button eligibility states
  const ingestUndoButtonDisabled =
    isRunningSave || props.isRunningIngest
      ? true
      : props.unsavedIngestProcessors
      ? false
      : !dirty;
  const ingestSaveButtonDisabled = ingestUndoButtonDisabled;
  const searchUndoButtonDisabled =
    isRunningSave || props.isRunningSearch
      ? true
      : props.unsavedSearchProcessors
      ? false
      : isEmpty(touched?.search) || !dirty;
  const searchSaveButtonDisabled = searchUndoButtonDisabled;

  // Utility fn to update the workflow UI config only, based on the current form values.
  // A get workflow API call is subsequently run to fetch the updated state.
  async function updateWorkflowUiConfig() {
    let success = false;
    setIsRunningSave(true);
    const updatedTemplate = {
      name: props.workflow?.name,
      ui_metadata: {
        ...props.workflow?.ui_metadata,
        config: formikToUiConfig(values, props.uiConfig as WorkflowConfig),
      },
    } as WorkflowTemplate;
    await dispatch(
      updateWorkflow({
        apiBody: {
          workflowId: props.workflow?.id as string,
          workflowTemplate: updatedTemplate,
          updateFields: true,
          reprovision: false,
        },
        dataSourceId,
      })
    )
      .unwrap()
      .then(async (result) => {
        success = true;
        props.setUnsavedIngestProcessors(false);
        props.setUnsavedSearchProcessors(false);
        setTouched({});
        new Promise((f) => setTimeout(f, 1000)).then(async () => {
          dispatch(
            getWorkflow({
              workflowId: props.workflow?.id as string,
              dataSourceId,
            })
          );
        });
      })
      .catch((error: any) => {
        console.error('Error saving workflow: ', error);
      })
      .finally(() => {
        setIsRunningSave(false);
      });
    return success;
  }

  // Utility fn to revert any unsaved changes, reset the form
  function revertUnsavedChanges(): void {
    resetForm();
    if (
      (props.unsavedIngestProcessors || props.unsavedSearchProcessors) &&
      props.workflow?.ui_metadata?.config !== undefined
    ) {
      props.setUiConfig(props.workflow?.ui_metadata?.config);
    }
  }

  return (
    <>
      {isExportModalOpen && (
        <ExportModal
          workflow={props.workflow}
          setIsExportModalOpen={setIsExportModalOpen}
        />
      )}
      {SHOW_ACTIONS_IN_HEADER ? (
        <>
          <TopNavMenu
            appName={PLUGIN_ID}
            config={topNavConfig}
            screenTitle={workflowName}
            showDataSourceMenu={dataSourceEnabled}
            dataSourceMenuConfig={
              dataSourceEnabled
                ? {
                    componentType: 'DataSourceView',
                    componentConfig: {
                      activeOption: [{ id: dataSourceId }],
                      fullWidth: false,
                      savedObjects: getSavedObjectsClient(),
                      notifications: getNotifications(),
                    },
                  }
                : undefined
            }
            showSearchBar={false}
            showQueryBar={false}
            showQueryInput={false}
            showDatePicker={false}
            showFilterBar={false}
            useDefaultBehaviors={true}
            setMenuMountPoint={getHeaderActionMenu()}
            groupActions={SHOW_ACTIONS_IN_HEADER}
          />
          <HeaderControl
            setMountPoint={setAppRightControls}
            controls={[
              {
                text: `Last updated: ${workflowLastUpdated}`,
                color: 'subdued',
                className: 'workflow-detail-last-updated',
              } as TopNavControlTextData,
            ]}
          />
        </>
      ) : (
        <>
          {dataSourceEnabled && DataSourceComponent}
          <EuiPageHeader
            style={{ marginTop: '-8px' }}
            pageTitle={
              <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
                <EuiFlexItem grow={false}>{workflowName}</EuiFlexItem>
              </EuiFlexGroup>
            }
            rightSideItems={[
              <EuiSmallButton
                style={{ marginTop: '8px' }}
                fill={true}
                onClick={() => {
                  setIsExportModalOpen(true);
                }}
                data-testid="exportButton"
              >
                Export
              </EuiSmallButton>,
              <EuiSmallButtonEmpty
                style={{ marginTop: '8px' }}
                onClick={() => {
                  history.replace(
                    constructUrlWithParams(
                      APP_PATH.WORKFLOWS,
                      undefined,
                      dataSourceId
                    )
                  );
                }}
                data-testid="closeButton"
              >
                Close
              </EuiSmallButtonEmpty>,
              <EuiSmallButtonEmpty
                style={{ marginTop: '8px' }}
                disabled={
                  props.selectedStep === CONFIG_STEP.INGEST
                    ? ingestSaveButtonDisabled
                    : searchSaveButtonDisabled
                }
                isLoading={isRunningSave}
                onClick={() => {
                  updateWorkflowUiConfig();
                }}
              >
                {`Save`}
              </EuiSmallButtonEmpty>,
              <EuiSmallButtonIcon
                style={{ marginTop: '8px' }}
                iconType="editorUndo"
                aria-label="undo changes"
                isDisabled={
                  props.selectedStep === CONFIG_STEP.INGEST
                    ? ingestUndoButtonDisabled
                    : searchUndoButtonDisabled
                }
                onClick={() => {
                  revertUnsavedChanges();
                }}
              />,
              <EuiText style={{ marginTop: '14px' }} color="subdued" size="s">
                {`Last updated: ${workflowLastUpdated}`}
              </EuiText>,
            ]}
            bottomBorder={false}
          />
        </>
      )}
    </>
  );
}
