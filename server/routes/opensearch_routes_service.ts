/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
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
  INGEST_NODE_API_PATH,
  Index,
  IngestPipelineConfig,
  SEARCH_INDEX_NODE_API_PATH,
  SIMULATE_PIPELINE_NODE_API_PATH,
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
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/catIndices/{pattern}`,
      validate: {
        params: schema.object({
          pattern: schema.string(),
          dataSourceId: schema.string(),
        }),
      },
    },
    opensearchRoutesService.catIndices
  );
  router.post(
    {
      path: `${SEARCH_INDEX_NODE_API_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        body: schema.any(),
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/search/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          dataSourceId: schema.string(),
        }),
        body: schema.any(),
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
      },
    },
    opensearchRoutesService.searchIndex
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/search/{index}/{search_pipeline}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          search_pipeline: schema.string(),
          dataSourceId: schema.string(),
        }),
        body: schema.any(),
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
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/ingest/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
          dataSourceId: schema.string(),
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
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/bulk/{pipeline}`,
      validate: {
        params: schema.object({
          pipeline: schema.string(),
          dataSourceId: schema.string(),
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
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/bulk`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
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
      },
    },
    opensearchRoutesService.simulatePipeline
  );
  router.post(
    {
      path: `${BASE_NODE_API_PATH}/{dataSourceId}/opensearch/simulatePipeline`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
        }),
        body: schema.object({
          pipeline: schema.any(),
          docs: schema.any(),
        }),
      },
    },
    opensearchRoutesService.simulatePipeline
  );
}

export class OpenSearchRoutesService {
  private client: any;
  dataSourceEnabled: boolean;

  constructor(client: any, dataSourceEnabled: boolean) {
    this.client = client;
    this.dataSourceEnabled =dataSourceEnabled;
  }

  catIndices = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { pattern } = req.params as { pattern: string };
    const { dataSourceId = '' } = req.params as { dataSourceId?: string };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
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

  searchIndex = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const { index, search_pipeline } = req.params as {
      index: string;
      search_pipeline: string | undefined;
    };
    const { dataSourceId = '' } = req.params as { dataSourceId?: string };
    const body = req.body;
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const response = await callWithRequest('search', {
        index,
        body,
        search_pipeline,
      });

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
    const { dataSourceId = '' } = req.params as { dataSourceId?: string };
    const { index } = req.params as { index: string };
    const doc = req.body;
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const response = await callWithRequest(
        'index', {
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
    const { dataSourceId = '' } = req.params as { dataSourceId?: string };
    const { pipeline } = req.params as {
      pipeline: string | undefined;
    };
    const body = req.body;

    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const response = await callWithRequest(
        'bulk', {
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
    const { dataSourceId = '' } = req.params as { dataSourceId?: string };
    const { pipeline, docs } = req.body as {
      pipeline: IngestPipelineConfig;
      docs: SimulateIngestPipelineDoc[];
    };
    try {
      const callWithRequest = getClientBasedOnDataSource(
        context,
        this.dataSourceEnabled,
        req,
        dataSourceId,
        this.client
      );

      const response = await callWithRequest(
        'ingest.simulate', {
          body: { pipeline, docs }
        });

      return res.ok({
        body: { docs: response.docs } as SimulateIngestPipelineResponse,
      });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
