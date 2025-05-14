/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { getIn, useFormikContext } from 'formik';
import {
  EuiAccordion,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiModal,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  CachedFormikState,
  COMPONENT_ID,
  CONFIG_STEP,
  PROCESSOR_CONTEXT,
  Workflow,
  WORKFLOW_RESOURCE_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowResource,
} from '../../../../../common';
import { NavComponent, ProcessorsComponent } from './nav_components';
import { DownArrow } from './down_arrow';
import {
  deprovisionWorkflow,
  getWorkflow,
  useAppDispatch,
} from '../../../../store';
import {
  getDataSourceId,
  getResourcesToBeForceDeleted,
} from '../../../../utils';
import { getCore } from '../../../../services';

interface IngestContentProps {
  workflow: Workflow | undefined;
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  selectedComponentId: string;
  setSelectedComponentId: (id: string) => void;
  setResourcesFlyoutOpen: (isOpen: boolean) => void;
  setResourcesFlyoutContext: (context: CONFIG_STEP) => void;
  ingestProvisioned: boolean;
  isProvisioningIngest: boolean;
  isUnsaved: boolean;
  readonly: boolean;
}

/**
 * The base component for rendering the ingest-related components, including real-time provisioning / error states.
 */
export function IngestContent(props: IngestContentProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const { values, errors, setFieldValue } = useFormikContext<
    WorkflowFormValues
  >();

  const ingestEnabled = getIn(values, 'ingest.enabled', true);

  // enable/disable ingest state
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [workflowResources, setWorkflowResources] = useState<
    WorkflowResource[]
  >([]);

  // TODO: allow fine-grained deprovisioning. In other words, allow omitting resource IDs from the
  // deprovision call from being force deleted. Currently, the API returns an error, so need
  // to handle gracefully on the UI.
  useEffect(() => {
    setWorkflowResources(
      props.workflow?.resourcesCreated?.filter(
        (workflowResource) =>
          workflowResource.type === WORKFLOW_RESOURCE_TYPE.INDEX_NAME ||
          workflowResource.type === WORKFLOW_RESOURCE_TYPE.PIPELINE_ID
      ) || []
    );
  }, [props.workflow]);

  return (
    <EuiAccordion
      initialIsOpen={true}
      id="ingestContentAccordion"
      buttonContent={
        <EuiText size="s">
          <h2>{'Ingest flow'}</h2>
        </EuiText>
      }
      extraAction={
        <>
          {deleteModalOpen && (
            <EuiModal
              style={{ width: '70vw' }}
              onClose={() => setDeleteModalOpen(false)}
            >
              <EuiModalHeader>
                <EuiModalHeaderTitle>
                  <p>{`Delete ingest flow?`}</p>
                </EuiModalHeaderTitle>
              </EuiModalHeader>
              <EuiFlexGroup direction="column" style={{ padding: '24px' }}>
                <EuiFlexItem grow={false}>
                  <EuiText>
                    The following resources will be deleted. If you have a
                    search flow created, be sure to update the source index and
                    re-create.
                  </EuiText>
                </EuiFlexItem>
                {workflowResources.map((resource) => {
                  return (
                    <EuiFlexItem
                      grow={false}
                      style={{ marginTop: '0px', marginBottom: '0px' }}
                    >
                      <EuiText color="subdued">{resource.id}</EuiText>
                    </EuiFlexItem>
                  );
                })}
              </EuiFlexGroup>
              <EuiModalFooter>
                <EuiSmallButtonEmpty
                  onClick={() => setDeleteModalOpen(false)}
                  data-testid="cancelDeleteIngestFlowButton"
                >
                  Cancel
                </EuiSmallButtonEmpty>
                <EuiSmallButton
                  isDisabled={isDeleting}
                  isLoading={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    await dispatch(
                      deprovisionWorkflow({
                        apiBody: {
                          workflowId: props.workflow?.id as string,
                          resourceIds: getResourcesToBeForceDeleted(
                            props.workflow
                          ),
                        },
                        dataSourceId,
                      })
                    )
                      .unwrap()
                      .then(async (result) => {
                        setTimeout(async () => {
                          await dispatch(
                            getWorkflow({
                              workflowId: props.workflow?.id as string,
                              dataSourceId,
                            })
                          );
                        }, 1000);
                      })
                      .catch((err: any) => {
                        getCore().notifications.toasts.addDanger(
                          `Failed to delete resources for ${props.workflow?.name}`
                        );
                        console.error(
                          `Failed to delete resources for ${props.workflow?.name}: ${err}`
                        );
                      })
                      .finally(() => {
                        setFieldValue('ingest.enabled', false);
                      });

                    setIsDeleting(false);
                    setDeleteModalOpen(false);
                  }}
                  data-testid="deleteWorkflowButton"
                  fill={true}
                  color="danger"
                >
                  Delete
                </EuiSmallButton>
              </EuiModalFooter>
            </EuiModal>
          )}
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="xs">
              <EuiFlexItem grow={false} style={{ marginTop: '10px' }}>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="controlsHorizontal"
                      size="s"
                      isDisabled={props.readonly}
                      aria-label="disableEnableIngest"
                      onClick={() => {
                        setPopoverOpen(true);
                      }}
                    />
                  }
                  isOpen={popoverOpen}
                  onClick={() => setPopoverOpen(!popoverOpen)}
                  closePopover={() => setPopoverOpen(false)}
                >
                  <EuiButtonEmpty
                    onClick={() => {
                      // setFieldValue('ingest.enabled', !ingestEnabled);
                      if (ingestEnabled && props.ingestProvisioned) {
                        setDeleteModalOpen(true);
                      } else {
                        setFieldValue('ingest.enabled', !ingestEnabled);
                      }
                      setPopoverOpen(false);
                    }}
                    iconSide={
                      ingestEnabled && props.ingestProvisioned
                        ? 'left'
                        : undefined
                    }
                    iconType={
                      ingestEnabled && props.ingestProvisioned
                        ? 'trash'
                        : undefined
                    }
                    color={
                      ingestEnabled && props.ingestProvisioned
                        ? 'danger'
                        : undefined
                    }
                  >
                    {ingestEnabled && props.ingestProvisioned
                      ? 'Delete ingest flow'
                      : ingestEnabled
                      ? 'Disable ingest flow'
                      : 'Enable ingest flow'}
                  </EuiButtonEmpty>
                </EuiPopover>
              </EuiFlexItem>
              {props.ingestProvisioned && (
                <EuiFlexItem grow={false} style={{ marginTop: '10px' }}>
                  <EuiButtonIcon
                    iconType="inspect"
                    size="s"
                    aria-label="inspect"
                    onClick={() => {
                      props.setResourcesFlyoutContext(CONFIG_STEP.INGEST);
                      props.setResourcesFlyoutOpen(true);
                    }}
                  />
                </EuiFlexItem>
              )}
              <EuiFlexItem
                grow={false}
                style={{ marginLeft: '8px', marginTop: '12px' }}
              >
                <EuiHealth
                  textSize="m"
                  color={
                    props.isProvisioningIngest
                      ? 'subdued'
                      : props.isUnsaved
                      ? 'warning'
                      : props.ingestProvisioned
                      ? 'primary'
                      : 'subdued'
                  }
                >
                  {!ingestEnabled
                    ? 'Disabled'
                    : props.isProvisioningIngest
                    ? 'Creating...'
                    : props.isUnsaved
                    ? 'Unsaved changes'
                    : props.ingestProvisioned
                    ? 'Active'
                    : 'Not created'}
                </EuiHealth>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </>
      }
    >
      <EuiSpacer size="s" />
      {ingestEnabled && (
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Sample data"
              icon="document"
              onClick={() => {
                props.setSelectedComponentId(COMPONENT_ID.SOURCE_DATA);
              }}
              isSelected={
                props.selectedComponentId === COMPONENT_ID.SOURCE_DATA
              }
              // TODO: need to specially handle empty state for this component
              // isError={!isEmpty(getIn(errors, COMPONENT_ID.SOURCE_DATA))}
            />
          </EuiFlexItem>
          <DownArrow />
          <EuiFlexItem grow={false}>
            <ProcessorsComponent
              uiConfig={props.uiConfig}
              setUiConfig={props.setUiConfig}
              title="Transform data"
              context={PROCESSOR_CONTEXT.INGEST}
              setCachedFormikState={props.setCachedFormikState}
              selectedComponentId={props.selectedComponentId}
              setSelectedComponentId={props.setSelectedComponentId}
              disabled={props.readonly}
            />
          </EuiFlexItem>
          <DownArrow />
          <EuiFlexItem grow={false}>
            <NavComponent
              title="Index"
              icon="indexSettings"
              onClick={() => {
                props.setSelectedComponentId(COMPONENT_ID.INGEST_DATA);
              }}
              isSelected={
                props.selectedComponentId === COMPONENT_ID.INGEST_DATA
              }
              isError={!isEmpty(getIn(errors, COMPONENT_ID.INGEST_DATA))}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiAccordion>
  );
}
