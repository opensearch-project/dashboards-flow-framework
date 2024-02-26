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
import { GET_WORKFLOW_PATH } from '../../common';
import { generateCustomError } from './helpers';

export function registerFlowFrameworkRoutes(
  router: IRouter,
  flowFrameworkRoutesService: FlowFrameworkRoutesService
): void {
  router.post(
    {
      path: `${GET_WORKFLOW_PATH}/{workflow_id}`,
      validate: {
        params: schema.object({
          index_name: schema.string(),
        }),
        body: schema.any(),
      },
    },
    flowFrameworkRoutesService.getWorkflow
  );
}

export class FlowFrameworkRoutesService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  getWorkflow = async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { workflow_id } = req.params;

    try {
      const response = await this.client
        .asScoped(req)
        .callAsCurrentUser('flowFramework.getWorkflow', { workflow_id });
      console.log('response from get workflow: ', response);
      return res.ok({ body: response });
    } catch (err: any) {
      return generateCustomError(res, err);
    }
  };
}
