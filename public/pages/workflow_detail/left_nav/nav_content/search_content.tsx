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
          <h3>{'Search flow'}</h3>
        </EuiText>
      }
      extraAction={
        <div style={{ marginBottom: '8px' }}>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="row" gutterSize="xs">
              {props.ingestProvisioned && (
                <EuiFlexItem grow={false} style={{ marginTop: '6px' }}>
                  <EuiButtonIcon
                    iconType="play"
                    size="s"
                    aria-label="test"
                    onClick={() => props.displaySearchPanel()}
                  />
                </EuiFlexItem>
              )}
              {props.searchProvisioned && (
                <EuiFlexItem grow={false} style={{ marginTop: '6px' }}>
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
                  textSize="s"
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
        </div>
      }
    >
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem grow={false}>
          <NavComponent
            dataTestId="searchPipelineButton" // for historical reasons, the naming of this component's test id doesn't exactly match its purpose
            title="Sample query"
            icon="editorCodeBlock"
            onClick={() => {
              props.setSelectedComponentId(COMPONENT_ID.SEARCH_REQUEST);
            }}
            isSelected={
              props.selectedComponentId === COMPONENT_ID.SEARCH_REQUEST
            }
            isError={
              (!isEmpty(getIn(errors, COMPONENT_ID.SEARCH_REQUEST)) ||
                !isEmpty(getIn(errors, 'search.index.name'))) &&
              props.isUnsaved
            }
          />
        </EuiFlexItem>
        <DownArrow />
        <EuiFlexItem grow={false}>
          <ProcessorsComponent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            title="Transform query"
            context={PROCESSOR_CONTEXT.SEARCH_REQUEST}
            setCachedFormikState={props.setCachedFormikState}
            selectedComponentId={props.selectedComponentId}
            setSelectedComponentId={props.setSelectedComponentId}
            disabled={props.readonly}
          />
        </EuiFlexItem>
        <DownArrow />
        <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
          <EuiText>Run query</EuiText>
          {/**
           * TODO: add back "Run query" panel once the content has been finalized
           */}
          {/* <NavComponent
            title="Run query"
            icon="list"
            onClick={() => {
              props.setSelectedComponentId(COMPONENT_ID.RUN_QUERY);
            }}
            isSelected={props.selectedComponentId === COMPONENT_ID.RUN_QUERY}
          /> */}
        </EuiFlexItem>
        <DownArrow />
        <EuiFlexItem grow={false}>
          <ProcessorsComponent
            uiConfig={props.uiConfig}
            setUiConfig={props.setUiConfig}
            title="Transform results"
            context={PROCESSOR_CONTEXT.SEARCH_RESPONSE}
            setCachedFormikState={props.setCachedFormikState}
            selectedComponentId={props.selectedComponentId}
            setSelectedComponentId={props.setSelectedComponentId}
            disabled={props.readonly}
          />
        </EuiFlexItem>
        <DownArrow />
        <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
          <EuiText>Search results</EuiText>
          {/**
           * TODO: add back "Search results" panel once the content has been finalized
           */}
          {/* 
          <NavComponent
            title="Search results"
            icon="list"
            onClick={() => {
              props.setSelectedComponentId(COMPONENT_ID.SEARCH_RESULTS);
            }}
            isSelected={
              props.selectedComponentId === COMPONENT_ID.SEARCH_RESULTS
            }
          /> */}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiAccordion>
  );
}
