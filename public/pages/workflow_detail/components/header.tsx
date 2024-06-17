/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiPageHeader,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonIcon,
  EuiPopover,
  EuiFieldText,
} from '@elastic/eui';
import {
  DEFAULT_NEW_WORKFLOW_STATE,
  WORKFLOW_STATE,
  Workflow,
} from '../../../../common';
import { updateWorkflow, useAppDispatch } from '../../../store';
import { reduceToTemplate } from '../../../utils';

interface WorkflowDetailHeaderProps {
  workflow?: Workflow;
}

export function WorkflowDetailHeader(props: WorkflowDetailHeaderProps) {
  const dispatch = useAppDispatch();

  // workflow state
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<WORKFLOW_STATE>('');

  // popover state
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [proposedName, setProposedName] = useState<string>('');

  useEffect(() => {
    if (props.workflow) {
      setWorkflowName(props.workflow.name);
      setWorkflowState(props.workflow.state || DEFAULT_NEW_WORKFLOW_STATE);
      setProposedName(props.workflow.name);
    }
  }, [props.workflow]);

  return (
    <EuiPageHeader
      style={{ marginTop: '-8px' }}
      pageTitle={
        <EuiFlexGroup direction="row" alignItems="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>{workflowName}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiPopover
              button={
                <EuiButtonIcon
                  iconType="pencil"
                  onClick={() => {
                    setIsPopoverOpen(true);
                  }}
                  aria-label="Edit workflow name"
                />
              }
              isOpen={isPopoverOpen}
              closePopover={() => setIsPopoverOpen(false)}
            >
              <EuiFlexGroup direction="row">
                <EuiFlexItem grow={false} style={{ marginTop: '24px' }}>
                  <EuiText>Name:</EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFieldText
                    value={proposedName}
                    onChange={(e) => {
                      setProposedName(e.target.value);
                    }}
                  ></EuiFieldText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill={false}
                    onClick={() => {
                      if (props.workflow) {
                        dispatch(
                          updateWorkflow({
                            workflowId: props.workflow.id as string,
                            workflowTemplate: {
                              ...reduceToTemplate(props.workflow),
                              name: proposedName,
                            },
                          })
                        );
                      }
                      setIsPopoverOpen(false);
                    }}
                  >
                    Save
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPopover>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginBottom: '10px' }}>
            <EuiText size="m">{workflowState}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      rightSideItems={[
        // TODO: implement export functionality
        <EuiButton fill={false} style={{ marginTop: '8px' }} onClick={() => {}}>
          Export
        </EuiButton>,
      ]}
      bottomBorder={false}
    />
  );
}
