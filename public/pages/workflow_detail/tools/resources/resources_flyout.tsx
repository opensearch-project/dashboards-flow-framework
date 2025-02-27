/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import {
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
} from '@elastic/eui';
import {
  CONFIG_STEP,
  customStringify,
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STEP_TYPE,
  WorkflowResource,
} from '../../../../../common';
import { ResourceFlyoutContent } from './resource_flyout_content';
import { extractIdsByStepType, getDataSourceId } from '../../../../utils';
import {
  AppState,
  getIndex,
  getIngestPipeline,
  getSearchPipeline,
  useAppDispatch,
} from '../../../../store';

interface ResourcesFlyoutProps {
  resources: WorkflowResource[];
  selectedStep: CONFIG_STEP;
  onClose: () => void;
}

/**
 * Flyout to display details for multiple workflow resources, depending on the context (ingest or search).
 * Dynamically render data nested under tabs if there are multiple - e.g., an index and ingest pipeline under the ingest context.
 */
export function ResourcesFlyout(props: ResourcesFlyoutProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();

  const {
    getIndexErrorMessage,
    getIngestPipelineErrorMessage,
    getSearchPipelineErrorMessage,
    indexDetails,
    ingestPipelineDetails,
    searchPipelineDetails,
  } = useSelector((state: AppState) => state.opensearch);

  // Fetch the filtered resource(s) based on ingest or search context
  const [allResources, setAllResources] = useState<WorkflowResource[]>([]);
  useEffect(() => {
    if (props.resources) {
      const resourcesMap = {} as { [id: string]: WorkflowResource };
      props.resources.forEach((resource) => {
        if (
          (props.selectedStep === CONFIG_STEP.INGEST &&
            (resource.stepType === WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE ||
              resource.stepType ===
                WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE)) ||
          (props.selectedStep === CONFIG_STEP.SEARCH &&
            resource.stepType ===
              WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE)
        ) {
          resourcesMap[resource.id] = resource;
        }
      });
      setAllResources(Object.values(resourcesMap || {}));
    }
  }, [props.resources]);

  // fetch details for each resource type
  useEffect(() => {
    const {
      indexIds,
      ingestPipelineIds,
      searchPipelineIds,
    } = extractIdsByStepType(allResources);
    if (indexIds) {
      try {
        dispatch(getIndex({ index: indexIds, dataSourceId }));
      } catch {}
    }
    if (ingestPipelineIds) {
      try {
        dispatch(
          getIngestPipeline({ pipelineId: ingestPipelineIds, dataSourceId })
        );
      } catch {}
    }
    if (searchPipelineIds) {
      try {
        dispatch(
          getSearchPipeline({ pipelineId: searchPipelineIds, dataSourceId })
        );
      } catch {}
    }
  }, [allResources]);

  // keep state for the resource index, and the selected tab ID (if applicable)
  const [selectedResourceIdx, setSelectedResourceIdx] = useState<number>(0);
  const [selectedTabId, setSelectedTabId] = useState<string>('');
  useEffect(() => {
    if (allResources) {
      setSelectedTabId(get(allResources, `0.id`));
    }
  }, [allResources]);

  // get the resource details, and any error message, based on the selected resource index
  const selectedResource = get(allResources, selectedResourceIdx, undefined) as
    | WorkflowResource
    | undefined;
  const selectedResourceDetailsObj =
    indexDetails[selectedResource?.id || ''] ??
    ingestPipelineDetails[selectedResource?.id || ''] ??
    searchPipelineDetails[selectedResource?.id || ''] ??
    '';
  const selectedResourceDetails = customStringify({
    [selectedResource?.id || '']: selectedResourceDetailsObj,
  });
  const selectedResourceErrorMessage =
    selectedResource?.stepType === WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
      ? getIndexErrorMessage
      : selectedResource?.stepType ===
        WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE
      ? getIngestPipelineErrorMessage
      : selectedResource?.stepType ===
        WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
      ? getSearchPipelineErrorMessage
      : (undefined as string | undefined);

  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>Resource details</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {allResources.length > 1 && (
          <EuiFlexItem grow={false}>
            <EuiTabs size="s" expand={false}>
              {allResources?.map((tab, idx) => {
                return (
                  <EuiTab
                    onClick={() => {
                      setSelectedTabId(tab.id);
                      setSelectedResourceIdx(idx);
                    }}
                    isSelected={tab.id === selectedTabId}
                    disabled={false}
                    key={idx}
                  >
                    {tab?.type === WORKFLOW_RESOURCE_TYPE.INDEX_NAME
                      ? 'Index'
                      : 'Pipeline'}
                  </EuiTab>
                );
              })}
            </EuiTabs>
            <EuiSpacer size="m" />
          </EuiFlexItem>
        )}
        {selectedResource !== undefined &&
          selectedResourceDetails !== undefined && (
            <ResourceFlyoutContent
              resource={selectedResource}
              resourceDetails={selectedResourceDetails}
              errorMessage={selectedResourceErrorMessage}
            />
          )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
