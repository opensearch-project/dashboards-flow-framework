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
  WORKFLOW_STATE,
  Workflow,
  toFormattedDate,
} from '../../../../common';
import { APP_PATH } from '../../../utils';
import { ExportModal } from './export_modal';

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

  return (
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
