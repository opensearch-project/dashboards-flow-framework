/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import yaml from 'js-yaml';
import jsonpath from 'jsonpath';
import { get } from 'lodash';
import {
  JSONPATH_ROOT_SELECTOR,
  ModelFormValue,
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STEP_TYPE,
  Workflow,
} from '../../common';
import { getCore } from '../services';

// Append 16 random characters
export function generateId(prefix?: string): string {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${
    prefix || ''
  }_${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasProvisionedIngestResources(
  workflow: Workflow | undefined
): boolean {
  let result = false;
  workflow?.resourcesCreated?.some((resource) => {
    if (
      resource.stepType ===
        WORKFLOW_STEP_TYPE.CREATE_INGEST_PIPELINE_STEP_TYPE ||
      resource.stepType === WORKFLOW_STEP_TYPE.CREATE_INDEX_STEP_TYPE
    ) {
      result = true;
    }
  });
  return result;
}

export function hasProvisionedSearchResources(
  workflow: Workflow | undefined
): boolean {
  let result = false;
  workflow?.resourcesCreated?.some((resource) => {
    if (
      resource.stepType === WORKFLOW_STEP_TYPE.CREATE_SEARCH_PIPELINE_STEP_TYPE
    ) {
      result = true;
    }
  });
  return result;
}

// returns a comma-delimited string of all resource IDs that need to be force deleted.
// see https://github.com/opensearch-project/flow-framework/pull/763
export function getResourcesToBeForceDeleted(
  workflow: Workflow | undefined
): string | undefined {
  const resources = workflow?.resourcesCreated?.filter(
    (workflowResource) =>
      workflowResource.type === WORKFLOW_RESOURCE_TYPE.INDEX_NAME ||
      workflowResource.type === WORKFLOW_RESOURCE_TYPE.PIPELINE_ID
  );

  if (resources !== undefined && resources.length > 0) {
    return resources
      .map((resource) => resource.id)
      .map(String)
      .join(',');
  } else {
    return undefined;
  }
}

export function getObjFromJsonOrYamlString(
  fileContents: string | undefined
): object | undefined {
  try {
    const jsonObj = JSON.parse(fileContents);
    return jsonObj;
  } catch (e) {}
  try {
    const yamlObj = yaml.load(fileContents) as object;
    return yamlObj;
  } catch (e) {}
  return undefined;
}

// Based off of https://opensearch.org/docs/latest/automating-configurations/api/create-workflow/#request-fields
// Only "name" field is required
export function isValidWorkflow(workflowObj: object | undefined): boolean {
  return workflowObj?.name !== undefined;
}

export function isValidUiWorkflow(workflowObj: object | undefined): boolean {
  return (
    isValidWorkflow(workflowObj) &&
    workflowObj?.ui_metadata?.config !== undefined &&
    workflowObj?.ui_metadata?.type !== undefined
  );
}

// ML inference processors will use standard dot notation or JSONPath depending on the input.
// We follow the same logic here to generate consistent results.
export function generateTransform(
  input: {},
  map: { key: string; value: string }[]
): {} {
  let output = {};
  map.forEach((mapEntry) => {
    const path = mapEntry.value;
    try {
      let transformedResult = undefined;
      if (mapEntry.value.startsWith(JSONPATH_ROOT_SELECTOR)) {
        // JSONPath transform
        transformedResult = jsonpath.query(input, path);
        // Non-JSONPath bracket notation not supported - throw an error
      } else if (mapEntry.value.includes('[') || mapEntry.value.includes(']')) {
        throw new Error();
        // Standard dot notation
      } else {
        transformedResult = get(input, path);
      }
      output = {
        ...output,
        [mapEntry.key]: transformedResult || '',
      };
    } catch (e: any) {
      getCore().notifications.toasts.addDanger(
        'Error generating expected output. Ensure your transforms are valid JSONPath or dot notation syntax.',
        e
      );
    }
  });
  return output;
}
