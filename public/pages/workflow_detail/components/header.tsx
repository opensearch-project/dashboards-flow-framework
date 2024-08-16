/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  WORKFLOW_STATE,
  Workflow,
  toFormattedDate,
} from '../../../../common';
import { APP_PATH, getDataSourceId } from '../../../utils';
import { ExportModal } from './export_modal';
import {
  getApplication,
  getCore,
  getDataSourceEnabled,
  getHeaderActionMenu,
  getNavigationUI,
  getNotifications,
  getSavedObjectsClient,
  getUISettings,
} from '../../../services';
import { HeaderVariant } from '../../../../../../src/core/public';
import {
  TopNavControlTextData,
  TopNavMenuData,
  TopNavMenuIconData,
} from '../../../../../../src/plugins/navigation/public';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const history = useHistory();
  // workflow state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<WORKFLOW_STATE>('');
  const [workflowLastUpdated, setWorkflowLastUpdated] = useState<string>('');

  // export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (props.workflow) {
      setWorkflowName(props.workflow.name);
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

  const { TopNavMenu, HeaderControl } = getNavigationUI();
  const { setAppRightControls } = getApplication();
  const {
    chrome: { setHeaderVariant },
  } = getCore();
  const uiSettings = getUISettings();
  const showActionsInHeader = uiSettings.get('home:useNewHomePage');

  useEffect(() => {
    if (showActionsInHeader) {
      setHeaderVariant?.(HeaderVariant.APPLICATION);
    }

    return () => {
      setHeaderVariant?.();
    };
  }, [setHeaderVariant, showActionsInHeader]);

  const onExportButtonClick = () => {
    setIsExportModalOpen(true);
  };

  const onExitButtonClick = () => {
    history.replace(APP_PATH.WORKFLOWS);
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

  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();

  return showActionsInHeader ? (
    <>
      {isExportModalOpen && (
        <ExportModal
          workflow={props.workflow}
          setIsExportModalOpen={setIsExportModalOpen}
        />
      )}
      <TopNavMenu
        appName={PLUGIN_ID}
        config={topNavConfig}
        screenTitle={workflowName}
        showDataSourceMenu={true}
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
        groupActions={showActionsInHeader}
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
      {isExportModalOpen && (
        <ExportModal
          workflow={props.workflow}
          setIsExportModalOpen={setIsExportModalOpen}
        />
      )}
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
          >
            Export
          </EuiSmallButton>,
          <EuiSmallButtonEmpty
            style={{ marginTop: '8px' }}
            onClick={() => {
              history.replace(APP_PATH.WORKFLOWS);
            }}
          >
            Close
          </EuiSmallButtonEmpty>,
          <EuiText style={{ marginTop: '16px' }} color="subdued" size="s">
            {`Last updated: ${workflowLastUpdated}`}
          </EuiText>,
        ]}
        bottomBorder={false}
      />
    </>
  );
}
