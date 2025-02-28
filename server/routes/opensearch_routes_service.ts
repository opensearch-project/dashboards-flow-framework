/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { isEmpty } from 'lodash';
import semver from 'semver';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
} from '../../../../src/core/server';
import {
  BASE_NODE_API_PATH,
  BULK_NODE_API_PATH,
  CAT_INDICES_NODE_API_PATH,
  GET_INDEX_NODE_API_PATH,
  GET_MAPPINGS_NODE_API_PATH,
  INGEST_NODE_API_PATH,
  INGEST_PIPELINE_NODE_API_PATH,
  Index,
  IndexMappings,
  IndexResponse,
  IngestPipelineConfig,
  IngestPipelineResponse,
  MINIMUM_FULL_SUPPORTED_VERSION,
  SEARCH_INDEX_NODE_API_PATH,
  SEARCH_PIPELINE_NODE_API_PATH,
  SIMULATE_PIPELINE_NODE_API_PATH,
  SearchPipelineResponse,
  SimulateIngestPipelineDoc,
  SimulateIngestPipelineResponse,
} from '../../common';
import { generateCustomError } from './helpers';
import { getClientBasedOnDataSource } from '../utils/helpers';

/**
 * Server-side routes to process OpenSearch-related node API calls and execute the
 * corresponding API calls against the OpenSearch cluster.
 */
export function registerOpenSearchRoutes(
  router: IRouter,
  opensearchRoutesService: OpenSearchRoutesService
): void {
  router.get(
    {
      path: `${CAT_INDICES_NODE_API_PATH}/{pattern}`,
      validate: {
        params: schema.object({
          pattern: schema.string(),
        }),
      },
    },
    opensearchRoutesService.catIndices
  );
  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/catIndices/{pattern}`,
      validate: {
        params: schema.object({
          pattern: schema.string(),
          data_source_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.catIndices
  );
  router.get(
    {
      path: `${GET_MAPPINGS_NODE_API_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getMappings
  );
  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/mappings/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          data_source_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getMappings
  );
  router.get(
    {
      path: `${GET_INDEX_NODE_API_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getIndex
  );
  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/getIndex/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          data_source_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getIndex
  );
  router.post(
    {
      path: `${SEARCH_INDEX_NODE_API_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          verbose: schema.boolean(),
          data_source_version: schema.maybe(schema.string()),
        }),
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/search/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          data_source_id: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          verbose: schema.boolean(),
          data_source_version: schema.maybe(schema.string()),
        }),
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.post(
    {
      path: `${SEARCH_INDEX_NODE_API_PATH}/{index}/{search_pipeline}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          search_pipeline: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          verbose: schema.boolean(),
          data_source_version: schema.maybe(schema.string()),
        }),
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/search/{index}/{search_pipeline}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          search_pipeline: schema.string(),
          data_source_id: schema.string(),
        }),
        body: schema.any(),
        query: schema.object({
          verbose: schema.boolean(),
          data_source_version: schema.maybe(schema.string()),
        }),
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.put(
    {
      path: `${INGEST_NODE_API_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.ingest
  );
  router.put(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/ingest/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          data_source_id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.ingest
  );
  router.post(
    {
      path: `${BULK_NODE_API_PATH}/{pipeline}`,
      validate: {
        params: schema.object({
          pipeline: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.bulk
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/bulk/{pipeline}`,
      validate: {
        params: schema.object({
          pipeline: schema.string(),
          data_source_id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.bulk
  );
  router.post(
    {
      path: BULK_NODE_API_PATH,
      validate: {
        body: schema.any(),
      },
    },
    opensearchRoutesService.bulk
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/bulk`,
      validate: {
        params: schema.object({
          data_source_id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.bulk
  );
  router.post(
    {
      path: SIMULATE_PIPELINE_NODE_API_PATH,
      validate: {
        body: schema.object({
          pipeline: schema.any(),
          docs: schema.any(),
        }),
        query: schema.object({
          verbose: schema.boolean(),
        }),
      },
    },
    opensearchRoutesService.simulatePipeline
  );
  router.post(
    {
      path: `${SIMULATE_PIPELINE_NODE_API_PATH}/{pipeline_id}`,
      validate: {
        body: schema.object({
          docs: schema.any(),
        }),
        params: schema.object({
          pipeline_id: schema.string(),
        }),
        query: schema.object({
          verbose: schema.boolean(),
        }),
      },
    },
    opensearchRoutesService.simulatePipeline
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/simulatePipeline`,
      validate: {
        params: schema.object({
          data_source_id: schema.string(),
        }),
        body: schema.object({
          pipeline: schema.any(),
          docs: schema.any(),
        }),
        query: schema.object({
          verbose: schema.boolean(),
        }),
      },
    },
    opensearchRoutesService.simulatePipeline
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/simulatePipeline/{pipeline_id}`,
      validate: {
        params: schema.object({
          data_source_id: schema.string(),
          pipeline_id: schema.string(),
        }),
        body: schema.object({
          docs: schema.any(),
        }),
        query: schema.object({
          verbose: schema.boolean(),
        }),
      },
    },
    opensearchRoutesService.simulatePipeline
  );
  router.get(
    {
      path: `${INGEST_PIPELINE_NODE_API_PATH}/{pipeline_id}`,
      validate: {
        params: schema.object({
          pipeline_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getIngestPipeline
  );
  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/getIngestPipeline/{pipeline_id}`,
      validate: {
        params: schema.object({
          pipeline_id: schema.string(),
          data_source_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getIngestPipeline
  );
  router.get(
    {
      path: `${SEARCH_PIPELINE_NODE_API_PATH}/{pipeline_id}`,
      validate: {
        params: schema.object({
          pipeline_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getSearchPipeline
  );
  router.get(
    {
      path: `${BASE_NODE_API_PATH}/{data_source_id}/opensearch/getSearchPipeline/{pipeline_id}`,
      validate: {
        params: schema.object({
          pipeline_id: schema.string(),
          data_source_id: schema.string(),
        }),
      },
    },
    opensearchRoutesService.getSearchPipeline
  );
}

export class OpenSearchRoutesService {
  private client: any;
  dataSourceEnabled: boolean;

  constructor(client: any, dataSourceEnabled: boolean) {
    this.client = client;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  catIndices = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pattern } = req.params as { pattern: string };
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('cat.indices', {
        index: pattern,
        format: 'json',
        h: 'health,index',
      });

      // re-formatting the index results to match Index
      const cleanedIndices = response.map((index: any) => ({
        name: index.index,
        health: index.health,
      })) as Index[];

      return res.ok({ body: cleanedIndices });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  getMappings = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { index } = req.params as { index: string };
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('indices.getMapping', {
        index,
      });

      // Response will be a dict with key being the index name. Attempt to
      // pull out the mappings. If any errors found (missing index, etc.), an error
      // will be thrown.
      const mappings = response[index]?.mappings as IndexMappings;

      return res.ok({ body: mappings });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  getIndex = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { index } = req.params as { index: string };
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      const response = await callWithRequest('indices.get', {
        index,
      });
      // re-formatting the results to match IndexResponse
      const cleanedIndexDetails = Object.entries(response).map(
        ([indexName, indexDetails]) => ({
          indexName,
          indexDetails,
        })
      ) as IndexResponse[];

      return res.ok({ body: cleanedIndexDetails });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  searchIndex = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { index, search_pipeline } = req.params as {
      index: string;
      search_pipeline: string | undefined;
    };
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    const { verbose = false, data_source_version = undefined } = req.query as {
      verbose?: boolean;
      data_source_version?: string;
    };
    const isPreV219 =
      data_source_version !== undefined
        ? semver.lt(data_source_version, MINIMUM_FULL_SUPPORTED_VERSION)
        : false;
    const body = req.body;
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );
      let response;
      // If verbose is false/undefined, or the version isn't eligible, omit the verbose param when searching.
      if (!verbose || isPreV219) {
        response = await callWithRequest('search', {
          index,
          body,
          search_pipeline,
        });
      } else {
        response = await callWithRequest('search', {
          index,
          body,
          search_pipeline,
          verbose_pipeline: verbose,
        });
      }

      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  ingest = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    const { index } = req.params as { index: string };
    const doc = req.body;
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('index', {
        index,
        body: doc,
      });

      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  bulk = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '' } = req.params as { data_source_id?: string };
    const { pipeline } = req.params as {
      pipeline: string | undefined;
    };
    const body = req.body;

    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('bulk', {
        body,
        pipeline,
      });

      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  simulatePipeline = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { data_source_id = '', pipeline_id = '' } = req.params as {
      data_source_id?: string;
      pipeline_id?: string;
    };
    const { pipeline, docs } = req.body as {
      pipeline?: IngestPipelineConfig;
      docs: SimulateIngestPipelineDoc[];
    };
    const { verbose = false } = req.query as {
      verbose?: boolean;
    };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      let response = undefined as any;

      if (!isEmpty(pipeline_id)) {
        response = await callWithRequest('ingest.simulate', {
          body: { docs },
          id: pipeline_id,
          verbose,
        });
      } else {
        response = await callWithRequest('ingest.simulate', {
          body: { docs, pipeline },
          verbose,
        });
      }
      return res.ok({
        body: { docs: response.docs } as SimulateIngestPipelineResponse,
      });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  getIngestPipeline = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pipeline_id } = req.params as { pipeline_id: string };
    const { data_source_id = '' } = req.params as { data_source_id?: string };

    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('ingest.getPipeline', {
        id: pipeline_id,
      });
      // re-formatting the results to match IngestPipelineResponse
      const cleanedIngestPipelineDetails = Object.entries(response).map(
        ([pipelineId, ingestPipelineDetails]) => ({
          pipelineId,
          ingestPipelineDetails,
        })
      ) as IngestPipelineResponse[];

      return res.ok({ body: cleanedIngestPipelineDetails });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };

  getSearchPipeline = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pipeline_id } = req.params as { pipeline_id: string };
    const { data_source_id = '' } = req.params as { data_source_id?: string };

    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        data_source_id,
        this.client
      );

      const response = await callWithRequest('coreClient.getSearchPipeline', {
        pipeline_id: pipeline_id,
      });

      // re-formatting the results to match SearchPipelineResponse
      const cleanedSearchPipelineDetails = Object.entries(response).map(
        ([pipelineId, searchPipelineDetails]) => ({
          pipelineId,
          searchPipelineDetails,
        })
      ) as SearchPipelineResponse[];

      return res.ok({ body: cleanedSearchPipelineDetails });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
