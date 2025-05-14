/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
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
  WorkflowFormValues,
} from '../../../../../common';
import { NavComponent, ProcessorsComponent } from './nav_components';
import { DownArrow } from './down_arrow';

interface SearchContentProps {
  uiConfig: WorkflowConfig;
  setUiConfig: (uiConfig: WorkflowConfig) => void;
  setCachedFormikState: (cachedFormikState: CachedFormikState) => void;
  selectedComponentId: string;
  setSelectedComponentId: (id: string) => void;
  setResourcesFlyoutOpen: (isOpen: boolean) => void;
  setResourcesFlyoutContext: (context: CONFIG_STEP) => void;
  displaySearchPanel: () => void;
  ingestProvisioned: boolean;
  searchProvisioned: boolean;
  isProvisioningSearch: boolean;
  isUnsaved: boolean;
  isDisabled: boolean;
  // TODO: propagate readonly to block adding/deleting processors
  readonly: boolean;
}

/**
 * The base component for rendering the search-related components, including real-time provisioning / error states.
 */
export function SearchContent(props: SearchContentProps) {
  const { errors } = useFormikContext<WorkflowFormValues>();

  return (
    <EuiAccordion
      initialIsOpen={true}
      id="searchContentAccordion"
      buttonContent={
        <EuiText size="s">
          <h2>{'Search flow'}</h2>
        </EuiText>
      }
      extraAction={
        <>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="xs">
              {props.ingestProvisioned && (
                <EuiFlexItem grow={false} style={{ marginTop: '10px' }}>
                  <EuiButtonIcon
                    iconType="play"
                    size="s"
                    aria-label="test"
                    onClick={() => props.displaySearchPanel()}
                  />
                </EuiFlexItem>
              )}
              {props.searchProvisioned && (
                <EuiFlexItem grow={false} style={{ marginTop: '10px' }}>
                  <EuiButtonIcon
                    iconType="inspect"
                    size="s"
                    aria-label="inspect"
                    onClick={() => {
                      props.setResourcesFlyoutContext(CONFIG_STEP.SEARCH);
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
                    props.isProvisioningSearch
                      ? 'subdued'
                      : props.isUnsaved
                      ? 'warning'
                      : props.searchProvisioned
                      ? 'primary'
                      : 'subdued'
                  }
                >
                  {props.isProvisioningSearch
                    ? 'Creating...'
                    : props.isUnsaved
                    ? 'Unsaved changes'
                    : props.searchProvisioned
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
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <NavComponent
            title="Search request"
            icon="editorCodeBlock"
            onClick={() => {
              props.setSelectedComponentId(COMPONENT_ID.SEARCH_REQUEST);
            }}
            isDisabled={props.isDisabled}
            isSelected={
              props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST
            }
            isError={!isEmpty(getIn(errors, COMPONENT_ID.SEARCH_REQUEST))}
          />
        </EuiFlexItem>
        <DownArrow isDisabled={props.isDisabled} />
        <EuiFlexItem grow={false}>
          <ProcessorsComponent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            title="Transform query"
            context={PROCESSOR_CONTEXT.SEARCH_REQUEST}
            setCachedFormikState={props.setCachedFormikState}
            selectedComponentId={props.selectedComponentId}
            setSelectedComponentId={props.setSelectedComponentId}
            isDisabled={props.isDisabled}
          />
        </EuiFlexItem>
        <DownArrow isDisabled={props.isDisabled} />
        <EuiFlexItem grow={false}>
          <NavComponent
            title="Retrieve from data source"
            icon="indexSettings"
            onClick={() => {
              console.log('retrieve from data source clicked');
            }}
            isDisabled={props.isDisabled}
          />
        </EuiFlexItem>
        <DownArrow isDisabled={props.isDisabled} />
        <EuiFlexItem grow={false}>
          <ProcessorsComponent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            title="Transform results"
            context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
            setCachedFormikState={props.setCachedFormikState}
            selectedComponentId={props.selectedComponentId}
            setSelectedComponentId={props.setSelectedComponentId}
            isDisabled={props.isDisabled}
          />
        </EuiFlexItem>
        <DownArrow isDisabled={props.isDisabled} />
        <EuiFlexItem grow={false}>
          <NavComponent
            title="Search results"
            icon="document"
            onClick={() => {
              console.log('search results clicked');
            }}
            isDisabled={props.isDisabled}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiAccordion>
  );
}
