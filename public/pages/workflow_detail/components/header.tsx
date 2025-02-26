/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, ReactElement } from 'react';
import {
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSmallButtonEmpty,
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiButtonIcon,
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
  USE_NEW_HOME_PAGE,
  getDataSourceId,
  dataSourceFilterFn,
  formikToUiConfig,
  constructHrefWithDataSourceId,
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
  TopNavControlData,
  TopNavMenuIconData,
} from '../../../../../../src/plugins/navigation/public';
import { MountPoint } from '../../../../../../src/core/public';
import { getWorkflow, updateWorkflow, useAppDispatch } from '../../../store';
import { useFormikContext } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import { EditWorkflowMetadataModal } from './edit_workflow_metadata_modal';
import { IntroFlyout } from './intro_flyout';

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
  setBlockNavigation: (blockNavigation: boolean) => void;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const dispatch = useAppDispatch();
  const { resetForm, setTouched, values, touched, dirty } = useFormikContext<
    WorkflowFormValues
  >();

  // workflow state
  const workflowName = getCharacterLimitedString(
    props.workflow?.name,
    MAX_WORKFLOW_NAME_TO_DISPLAY
  );
  const workflowLastUpdated = toFormattedDate(
    // @ts-ignore
    props.workflow?.lastUpdated
  ).toString();

  // intro flyout state
  const [introFlyoutOpened, setIntroFlyoutOpened] = useState<boolean>(false);

  // modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEditWorkflowModalOpen, setIsEditWorkflowModalOpen] = useState<
    boolean
  >(false);

  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { TopNavMenu, HeaderControl } = getNavigationUI();
  const { setAppRightControls } = getApplication();
  const {
    chrome: { setHeaderVariant },
  } = getCore();

  // When NewHomePage is enabled, use 'application' HeaderVariant; otherwise, use 'page' HeaderVariant (default).
  useEffect(() => {
    if (USE_NEW_HOME_PAGE) {
      setHeaderVariant?.(HeaderVariant.APPLICATION);
    }
    return () => {
      setHeaderVariant?.();
    };
  }, [setHeaderVariant, USE_NEW_HOME_PAGE]);

  // get & render the data source component, if applicable
  let DataSourceComponent: ReactElement | null = null;
  if (dataSourceEnabled && getDataSourceManagementPlugin() && dataSourceId) {
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
  const undoDisabled =
    props.selectedStep === CONFIG_STEP.INGEST
      ? ingestUndoButtonDisabled
      : searchUndoButtonDisabled;
  const saveDisabled =
    props.selectedStep === CONFIG_STEP.INGEST
      ? ingestSaveButtonDisabled
      : searchSaveButtonDisabled;

  useEffect(() => {
    props.setBlockNavigation(!saveDisabled);
  }, [saveDisabled]);

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
      {introFlyoutOpened && (
        <IntroFlyout onClose={() => setIntroFlyoutOpened(false)} />
      )}
      {isExportModalOpen && (
        <ExportModal
          workflow={props.workflow}
          unsavedIngestProcessors={props.unsavedIngestProcessors}
          unsavedSearchProcessors={props.unsavedSearchProcessors}
          setIsExportModalOpen={setIsExportModalOpen}
        />
      )}
      {isEditWorkflowModalOpen && (
        <EditWorkflowMetadataModal
          workflow={props.workflow}
          setIsModalOpen={setIsEditWorkflowModalOpen}
        />
      )}
      {USE_NEW_HOME_PAGE ? (
        <>
          <TopNavMenu
            appName={PLUGIN_ID}
            config={[
              {
                iconType: 'editorUndo',
                tooltip: 'Revert changes',
                ariaLabel: 'Revert',
                run: revertUnsavedChanges,
                controlType: 'icon',
                disabled: undoDisabled,
              } as TopNavMenuIconData,
              {
                iconType: 'save',
                tooltip: 'Save',
                ariaLabel: 'Save',
                run: updateWorkflowUiConfig,
                controlType: 'icon',
                disabled: saveDisabled,
              } as TopNavMenuIconData,
              {
                iconType: 'exit',
                tooltip: 'Return to projects',
                ariaLabel: 'Exit',
                href: constructHrefWithDataSourceId(
                  APP_PATH.WORKFLOWS,
                  dataSourceId
                ),
                controlType: 'icon',
              } as TopNavMenuIconData,
              {
                iconType: 'iInCircle',
                tooltip: 'How it works',
                ariaLabel: 'How it works',
                run: () => setIntroFlyoutOpened(true),
                controlType: 'icon',
              } as TopNavMenuIconData,
            ]}
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
            groupActions={true}
          />
          <HeaderControl
            setMountPoint={setAppRightControls}
            controls={[
              {
                text: `Last saved: ${workflowLastUpdated}`,
                color: 'subdued',
                className: 'workflow-detail-last-updated',
              } as TopNavControlData,
              {
                renderComponent: (
                  <EuiSmallButton
                    fill={true}
                    onClick={() => {
                      setIsExportModalOpen(true);
                    }}
                    data-testid="exportButton"
                  >
                    Export
                  </EuiSmallButton>
                ),
              },
            ]}
          />
        </>
      ) : (
        <>
          {dataSourceEnabled && DataSourceComponent}
          <EuiPageHeader
            pageTitle={
              <EuiFlexGroup direction="row" gutterSize="s">
                <EuiFlexItem grow={false}>{workflowName}</EuiFlexItem>
                <EuiFlexItem grow={false} style={{ marginTop: '18px' }}>
                  <EuiButtonIcon
                    iconType={'gear'}
                    aria-label="editWorkflowMetadata"
                    onClick={() => {
                      setIsEditWorkflowModalOpen(true);
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            rightSideItems={[
              <EuiSmallButton
                fill={true}
                onClick={() => {
                  setIsExportModalOpen(true);
                }}
                data-testid="exportButton"
              >
                Export
              </EuiSmallButton>,
              <EuiSmallButtonEmpty
                href={constructHrefWithDataSourceId(
                  APP_PATH.WORKFLOWS,
                  dataSourceId
                )}
                data-testid="closeButton"
              >
                Close
              </EuiSmallButtonEmpty>,
              <EuiSmallButtonEmpty
                disabled={saveDisabled}
                isLoading={isRunningSave}
                onClick={() => {
                  updateWorkflowUiConfig();
                }}
              >
                {`Save`}
              </EuiSmallButtonEmpty>,
              <EuiSmallButtonIcon
                data-testid="undoButton"
                iconType="editorUndo"
                aria-label="undo changes"
                isDisabled={undoDisabled}
                onClick={() => {
                  revertUnsavedChanges();
                }}
              />,
              <EuiSmallButtonEmpty
                disabled={false}
                onClick={() => {
                  setIntroFlyoutOpened(true);
                }}
              >
                {`How it works`}
              </EuiSmallButtonEmpty>,
              <EuiText color="subdued" size="s">
                {`Last saved: ${workflowLastUpdated}`}
              </EuiText>,
            ]}
            bottomBorder={false}
            rightSideGroupProps={{
              alignItems: 'center',
            }}
            paddingSize="s"
          />
        </>
      )}
    </>
  );
}
