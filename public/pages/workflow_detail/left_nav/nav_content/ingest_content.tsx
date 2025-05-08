/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import {
  CachedFormikState,
  COMPONENT_ID,
  CONFIG_STEP,
  PROCESSOR_CONTEXT,
  WorkflowConfig,
} from '../../../../../common';
import { BooleanField } from '../../workflow_inputs';
import { NavComponent, ProcessorsComponent } from './nav_components';
import { DownArrow } from './down_arrow';

interface IngestContentProps {
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
}

/**
 * The base component for rendering the ingest-related components, including real-time provisioning / error states.
 */
export function IngestContent(props: IngestContentProps) {
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
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="xs">
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
              <EuiFlexItem
                grow={false}
                style={{ marginLeft: '8px', marginTop: '12px' }}
              >
                <EuiHealth
                  textSize="m"
                  color={
                    props.isUnsaved
                      ? 'warning'
                      : props.ingestProvisioned
                      ? 'primary'
                      : 'subdued'
                  }
                >
                  {props.isProvisioningIngest
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
          {/* <EuiFlexItem grow={false}>
                    <EuiFlexGroup direction="row" gutterSize="s">
                      <EuiFlexItem grow={false} style={{ marginTop: '16px' }}>
                        <BooleanField
                          fieldPath="ingest.enabled"
                          label="Enable ingest flow"
                          type="Switch"
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem> */}
        </>
      }
    >
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <NavComponent
            title="Sample data"
            icon="document"
            onClick={() => {
              props.setSelectedComponentId(COMPONENT_ID.SOURCE_DATA);
            }}
            isSelected={props.selectedComponentId === COMPONENT_ID.SOURCE_DATA}
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
            isSelected={props.selectedComponentId === COMPONENT_ID.INGEST_DATA}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiAccordion>
  );
}
