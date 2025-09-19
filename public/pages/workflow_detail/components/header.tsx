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
  EuiButtonIcon,
} from '@elastic/eui';
import {
  PLUGIN_ID,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  Workflow,
  getCharacterLimitedString,
  toFormattedDate,
  WorkflowConfig,
  WORKFLOW_TYPE,
} from '../../../../common';
import {
  APP_PATH,
  USE_NEW_HOME_PAGE,
  getDataSourceId,
  dataSourceFilterFn,
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
import { EditWorkflowMetadataModal } from './edit_workflow_metadata_modal';
import { IntroFlyout } from './intro_flyout';
import { AgenticSearchIntroFlyout } from './agentic_search_intro_flyout';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
  uiConfig: WorkflowConfig | undefined;
  setActionMenu: (menuMount?: MountPoint) => void;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
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

  return (
    <>
      {introFlyoutOpened &&
        props.workflow?.ui_metadata?.type !== WORKFLOW_TYPE.AGENTIC_SEARCH && (
          <IntroFlyout onClose={() => setIntroFlyoutOpened(false)} />
        )}
      {introFlyoutOpened &&
        props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.AGENTIC_SEARCH && (
          <AgenticSearchIntroFlyout
            onClose={() => setIntroFlyoutOpened(false)}
          />
        )}
      {isExportModalOpen && (
        <ExportModal
          workflow={props.workflow}
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
            config={
              props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.AGENTIC_SEARCH
                ? [
                    {
                      iconType: 'exit',
                      tooltip: 'Return to workflows',
                      ariaLabel: 'Exit',
                      href: constructHrefWithDataSourceId(
                        APP_PATH.WORKFLOWS,
                        dataSourceId
                      ),
                      controlType: 'icon',
                    } as TopNavMenuIconData,
                    {
                      iconType: 'gear',
                      tooltip: 'Edit workflow settings',
                      ariaLabel: 'Edit workflow settings',
                      run: () => setIsEditWorkflowModalOpen(true),
                      controlType: 'icon',
                    } as TopNavMenuIconData,
                  ]
                : [
                    {
                      iconType: 'exit',
                      tooltip: 'Return to workflows',
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
                    {
                      iconType: 'gear',
                      tooltip: 'Edit workflow settings',
                      ariaLabel: 'Edit workflow settings',
                      run: () => setIsEditWorkflowModalOpen(true),
                      controlType: 'icon',
                    } as TopNavMenuIconData,
                  ]
            }
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
              <EuiFlexGroup
                direction="row"
                gutterSize="s"
                style={{ marginTop: '-12px' }}
              >
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
            rightSideItems={
              props.workflow?.ui_metadata?.type === WORKFLOW_TYPE.AGENTIC_SEARCH
                ? [
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

                    <EuiText color="subdued" size="s">
                      {`Last saved: ${workflowLastUpdated}`}
                    </EuiText>,
                  ]
                : [
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
                  ]
            }
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
