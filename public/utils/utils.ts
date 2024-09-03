/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import yaml from 'js-yaml';
import jsonpath from 'jsonpath';
import { escape, get } from 'lodash';
import {
  JSONPATH_ROOT_SELECTOR,
  MapFormValue,
  ModelInput,
  ModelInputFormField,
  ModelInterface,
  ModelOutput,
  ModelOutputFormField,
  SimulateIngestPipelineDoc,
  SimulateIngestPipelineResponse,
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STEP_TYPE,
  Workflow,
  customStringify,
} from '../../common';
import { getCore, getDataSourceEnabled } from '../services';
import { MDSQueryParams } from '../../common/interfaces';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import * as pluginManifest from '../../opensearch_dashboards.json';
import { DataSourceAttributes } from '../../../../src/plugins/data_source/common/data_sources';
import { SavedObject } from '../../../../src/core/public';
import semver from 'semver';

// Generate a random ID. Optionally add a prefix. Optionally
// override the default # characters to generate.
export function generateId(prefix?: string, numChars: number = 16): string {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const uniqueId = `${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
  return `${prefix || ''}_${uniqueId.substring(0, numChars)}`;
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
  fileContents?: string
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

// Docs are expected to be in a certain format to be passed to the simulate ingest pipeline API.
// for details, see https://opensearch.org/docs/latest/ingest-pipelines/simulate-ingest
export function prepareDocsForSimulate(
  docs: string,
  indexName: string
): SimulateIngestPipelineDoc[] {
  const preparedDocs = [] as SimulateIngestPipelineDoc[];
  const docObjs = JSON.parse(docs) as {}[];
  docObjs.forEach((doc) => {
    preparedDocs.push({
      _index: indexName,
      _id: generateId(),
      _source: doc,
    });
  });
  return preparedDocs;
}

// Docs are returned in a certain format from the simulate ingest pipeline API. We want
// to format them into a more readable string to display
export function unwrapTransformedDocs(
  simulatePipelineResponse: SimulateIngestPipelineResponse
) {
  let errorDuringSimulate = undefined as string | undefined;
  const transformedDocsSources = simulatePipelineResponse.docs.map(
    (transformedDoc) => {
      if (transformedDoc.error !== undefined) {
        errorDuringSimulate = transformedDoc.error.reason || '';
      } else {
        return transformedDoc.doc._source;
      }
    }
  );

  // there is an edge case where simulate may fail if there is some server-side or OpenSearch issue when
  // running ingest (e.g., hitting rate limits on remote model)
  // We pull out any returned error from a document and propagate it to the user.
  if (errorDuringSimulate !== undefined) {
    getCore().notifications.toasts.addDanger(
      `Failed to simulate ingest on all documents: ${errorDuringSimulate}`
    );
  }
  return customStringify(transformedDocsSources);
}

// ML inference processors will use standard dot notation or JSONPath depending on the input.
// We follow the same logic here to generate consistent results.
export function generateTransform(input: {}, map: MapFormValue): {} {
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

// Derive the collection of model inputs from the model interface JSONSchema into a form-ready list
export function parseModelInputs(
  modelInterface: ModelInterface | undefined
): ModelInputFormField[] {
  const modelInputsObj = get(
    modelInterface,
    // model interface input values will always be nested under a base "parameters" obj.
    // we iterate through the obj properties to extract the individual inputs
    'input.properties.parameters.properties',
    {}
  ) as { [key: string]: ModelInput };
  return Object.keys(modelInputsObj).map(
    (inputName: string) =>
      ({
        label: inputName,
        ...modelInputsObj[inputName],
      } as ModelInputFormField)
  );
}

// Derive the collection of model outputs from the model interface JSONSchema into a form-ready list
export function parseModelOutputs(
  modelInterface: ModelInterface | undefined
): ModelOutputFormField[] {
  const modelOutputsObj = get(modelInterface, 'output.properties', {}) as {
    [key: string]: ModelOutput;
  };
  return Object.keys(modelOutputsObj).map(
    (outputName: string) =>
      ({
        label: outputName,
        ...modelOutputsObj[outputName],
      } as ModelOutputFormField)
  );
}

export const getDataSourceFromURL = (location: {
  search: string;
}): MDSQueryParams => {
  const queryParams = queryString.parse(location.search);
  const dataSourceId = queryParams.dataSourceId;
  return {
    dataSourceId:
      typeof dataSourceId === 'string' ? escape(dataSourceId) : undefined,
  };
};

export const constructHrefWithDataSourceId = (
  basePath: string,
  dataSourceId: string = ''
): string => {
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const url = new URLSearchParams();
  if (dataSourceEnabled && dataSourceId !== undefined) {
    url.set('dataSourceId', dataSourceId);
  }
  return `#${basePath}?${url.toString()}`;
};

export const constructUrlWithParams = (
  basePath: string,
  workflowId?: string,
  dataSourceId?: string
): string => {
  const path = workflowId ? `${basePath}/${workflowId}` : basePath;
  return `${path}${
    dataSourceId !== undefined ? `?dataSourceId=${dataSourceId}` : ''
  }`;
};

export const getDataSourceId = () => {
  const location = useLocation();
  const mdsQueryParams = getDataSourceFromURL(location);
  return mdsQueryParams.dataSourceId;
};

// converts camelCase to a space-delimited string with the first word capitalized.
// useful for converting config IDs (in snake_case) to a formatted form title
export function camelCaseToTitleString(snakeCaseString: string): string {
  return snakeCaseString
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const dataSourceFilterFn = (
  dataSource: SavedObject<DataSourceAttributes>
) => {
  const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
  const installedPlugins = dataSource?.attributes?.installedPlugins || [];
  return (
    semver.satisfies(
      dataSourceVersion,
      pluginManifest.supportedOSDataSourceVersions
    ) &&
    pluginManifest.requiredOSDataSourcePlugins.every((plugin) =>
      installedPlugins.includes(plugin)
    )
  );
};
