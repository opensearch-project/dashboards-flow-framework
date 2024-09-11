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
} from '@elastic/eui';
import {
  DEFAULT_NEW_WORKFLOW_STATE,
  PLUGIN_ID,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  WORKFLOW_STATE,
  Workflow,
  getCharacterLimitedString,
  toFormattedDate,
} from '../../../../common';
import {
  APP_PATH,
  SHOW_ACTIONS_IN_HEADER,
  constructUrlWithParams,
  getDataSourceId,
  dataSourceFilterFn,
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

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
  setActionMenu: (menuMount?: MountPoint) => void;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const history = useHistory();
  // workflow state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<WORKFLOW_STATE>('');
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

  useEffect(() => {
    if (props.workflow) {
      setWorkflowName(
        getCharacterLimitedString(
          props.workflow.name,
          MAX_WORKFLOW_NAME_TO_DISPLAY
        )
      );
      setWorkflowState(props.workflow.state || DEFAULT_NEW_WORKFLOW_STATE);
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

  let renderDataSourceComponent: ReactElement | null = null;
  if (dataSourceEnabled && getDataSourceManagementPlugin()) {
    const DataSourceMenu = getDataSourceManagementPlugin().ui.getDataSourceMenu<
      DataSourceViewConfig
    >();
    renderDataSourceComponent = (
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
          {dataSourceEnabled && renderDataSourceComponent}
          <EuiPageHeader
            style={{ marginTop: '-8px' }}
            pageTitle={
              <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
                <EuiFlexItem grow={false}>{workflowName}</EuiFlexItem>
                <EuiFlexItem grow={false} style={{ marginBottom: '10px' }}>
                  <EuiText size="m">{workflowState}</EuiText>
                </EuiFlexItem>
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
