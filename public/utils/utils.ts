/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import yaml from 'js-yaml';
import jsonpath from 'jsonpath';
import { escape, get } from 'lodash';
import {
  JSONPATH_ROOT_SELECTOR,
  MODEL_OUTPUT_SCHEMA_FULL_PATH,
  MODEL_OUTPUT_SCHEMA_NESTED_PATH,
  MapFormValue,
  ModelInputFormField,
  ModelInterface,
  ModelOutput,
  ModelOutputFormField,
  SimulateIngestPipelineDoc,
  SimulateIngestPipelineResponse,
  WORKFLOW_RESOURCE_TYPE,
  WORKFLOW_STEP_TYPE,
  Workflow,
} from '../../common';
import { getCore, getDataSourceEnabled } from '../services';
import {
  MDSQueryParams,
  MapEntry,
  ModelInputMap,
  ModelOutputMap,
} from '../../common/interfaces';
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
    // @ts-ignore
    const jsonObj = JSON.parse(fileContents);
    return jsonObj;
  } catch (e) {}
  try {
    // @ts-ignore
    const yamlObj = yaml.load(fileContents) as object;
    return yamlObj;
  } catch (e) {}
  return undefined;
}

// Based off of https://opensearch.org/docs/latest/automating-configurations/api/create-workflow/#request-fields
// Only "name" field is required
export function isValidWorkflow(workflowObj: any): boolean {
  return workflowObj?.name !== undefined;
}

export function isValidUiWorkflow(workflowObj: any): boolean {
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
): any[] {
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
  return transformedDocsSources;
}

// ML inference processors will use standard dot notation or JSONPath depending on the input.
// We follow the same logic here to generate consistent results.
export function generateTransform(input: {} | [], map: MapFormValue): {} {
  let output = {};
  map.forEach((mapEntry) => {
    try {
      const transformedResult = getTransformedResult(
        mapEntry,
        input,
        mapEntry.value
      );
      output = {
        ...output,
        [mapEntry.key]: transformedResult || '',
      };
    } catch (e: any) {}
  });
  return output;
}

// Similar to generateTransform, but collapse the values of the input array into
// a single field value in the transformed output.
// A specialty scenario for when configuring input on search response processors, one-to-one is false,
// and the input is an array.
export function generateArrayTransform(input: [], map: MapFormValue): {}[] {
  let output = [] as {}[];
  map.forEach((mapEntry) => {
    try {
      const transformedResult = input.map((inputEntry) =>
        getTransformedResult(mapEntry, inputEntry, mapEntry.value)
      );
      output = {
        ...output,
        [mapEntry.key]: transformedResult || '',
      };
    } catch (e: any) {}
  });
  return output;
}

function getTransformedResult(
  mapEntry: MapEntry,
  input: {},
  path: string
): any {
  // Edge case: if the path is ".", it implies returning
  // the entire value. This may happen if full_response_path=false
  // and the input is the entire result with nothing else to parse out.
  // get() does not cover this case, so we override manually.
  return path === '.'
    ? input
    : mapEntry.value.startsWith(JSONPATH_ROOT_SELECTOR)
    ? // JSONPath transform
      jsonpath.query(input, path)
    : // Standard dot notation
      get(input, path);
}

// Derive the collection of model inputs from the model interface JSONSchema into a form-ready list
export function parseModelInputs(
  modelInterface: ModelInterface | undefined
): ModelInputFormField[] {
  const modelInputsObj = parseModelInputsObj(modelInterface);
  return Object.keys(modelInputsObj).map(
    (inputName: string) =>
      ({
        label: inputName,
        ...modelInputsObj[inputName],
      } as ModelInputFormField)
  );
}

// Derive the collection of model inputs as an obj
export function parseModelInputsObj(
  modelInterface: ModelInterface | undefined
): ModelInputMap {
  return get(
    modelInterface,
    // model interface input values will always be nested under a base "parameters" obj.
    // we iterate through the obj properties to extract the individual inputs
    'input.properties.parameters.properties',
    {}
  ) as ModelInputMap;
}

// Derive the collection of model outputs from the model interface JSONSchema into a form-ready list.
// Expose the full path or nested path depending on fullResponsePath
export function parseModelOutputs(
  modelInterface: ModelInterface | undefined,
  fullResponsePath: boolean = false
): ModelOutputFormField[] {
  const modelOutputsObj = get(
    modelInterface,
    fullResponsePath
      ? MODEL_OUTPUT_SCHEMA_FULL_PATH
      : MODEL_OUTPUT_SCHEMA_NESTED_PATH,
    {}
  ) as {
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

// Derive the collection of model outputs as an obj.
// Expose the full path or nested path depending on fullResponsePath
export function parseModelOutputsObj(
  modelInterface: ModelInterface | undefined,
  fullResponsePath: boolean = false
): ModelOutputMap {
  return get(
    modelInterface,
    fullResponsePath
      ? MODEL_OUTPUT_SCHEMA_FULL_PATH
      : MODEL_OUTPUT_SCHEMA_NESTED_PATH,
    {}
  ) as ModelOutputMap;
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
