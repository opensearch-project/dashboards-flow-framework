/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import {
  COMPONENT_CLASS,
  IProcessorConfig,
  NODE_CATEGORY,
  PROCESSOR_TYPE,
  WorkflowConfig,
} from '../../common';
import { uiConfigToWorkspaceFlow } from './config_to_workspace_utils';

// Mock generateId to return deterministic IDs
let mockIdCounter = 0;
jest.mock('./utils', () => ({
  generateId: jest.fn((prefix: string) => `${prefix}_${++mockIdCounter}`),
}));

beforeEach(() => {
  mockIdCounter = 0;
});

const makeProcessor = (
  id: string,
  name: string,
  type: PROCESSOR_TYPE = PROCESSOR_TYPE.ML
): IProcessorConfig => ({
  id,
  name,
  type,
  fields: [],
});

const makeConfig = (
  ingestProcessors: IProcessorConfig[] = [],
  requestProcessors: IProcessorConfig[] = [],
  responseProcessors: IProcessorConfig[] = []
): WorkflowConfig =>
  ({
    ingest: {
      enabled: { id: 'enabled', type: 'boolean', value: true },
      pipelineName: { id: 'pipelineName', type: 'string', value: 'ingest-pipeline' },
      enrich: { processors: ingestProcessors },
      index: {
        name: { id: 'name', type: 'string' },
        mappings: { id: 'mappings', type: 'json' },
        settings: { id: 'settings', type: 'json' },
      },
    },
    search: {
      request: { id: 'request', type: 'json' },
      index: { name: { id: 'name', type: 'string' } },
      pipelineName: { id: 'pipelineName', type: 'string', value: 'search-pipeline' },
      enrichRequest: { processors: requestProcessors },
      enrichResponse: { processors: responseProcessors },
    },
  } as unknown as WorkflowConfig);

describe('config_to_workspace_utils', () => {
  describe('uiConfigToWorkspaceFlow - no processors', () => {
    test('generates ingest and search parent nodes', () => {
      const result = uiConfigToWorkspaceFlow(makeConfig());
      const ingestParent = result.nodes.find(
        (n) => n.type === NODE_CATEGORY.INGEST_GROUP
      );
      const searchParent = result.nodes.find(
        (n) => n.type === NODE_CATEGORY.SEARCH_GROUP
      );
      expect(ingestParent).toBeDefined();
      expect(searchParent).toBeDefined();
    });

    test('generates document and index nodes for ingest', () => {
      const result = uiConfigToWorkspaceFlow(makeConfig());
      const nodeTypes = result.nodes.map((n) => n.data?.type).filter(Boolean);
      expect(nodeTypes).toContain(COMPONENT_CLASS.DOCUMENT);
      expect(nodeTypes).toContain(COMPONENT_CLASS.INDEX);
    });

    test('generates search request, index, and search response nodes for search', () => {
      const result = uiConfigToWorkspaceFlow(makeConfig());
      const nodeTypes = result.nodes.map((n) => n.data?.type).filter(Boolean);
      expect(nodeTypes).toContain(COMPONENT_CLASS.SEARCH_REQUEST);
      expect(nodeTypes).toContain(COMPONENT_CLASS.SEARCH_RESPONSE);
      expect(nodeTypes.filter((t) => t === COMPONENT_CLASS.INDEX)).toHaveLength(2);
    });

    test('creates direct edges when no processors exist', () => {
      const result = uiConfigToWorkspaceFlow(makeConfig());
      // Ingest: doc -> index (1), Search: request -> index -> response (2)
      expect(result.edges).toHaveLength(3);
    });
  });

  describe('uiConfigToWorkspaceFlow - with ingest processors', () => {
    test('adds ML processor nodes', () => {
      const config = makeConfig([makeProcessor('p1', 'ML Proc')]);
      const result = uiConfigToWorkspaceFlow(config);
      const mlNodes = result.nodes.filter(
        (n) => n.data?.type === COMPONENT_CLASS.ML_TRANSFORMER
      );
      expect(mlNodes).toHaveLength(1);
    });

    test('creates edges through processors', () => {
      const config = makeConfig([makeProcessor('p1', 'ML Proc')]);
      const result = uiConfigToWorkspaceFlow(config);
      // Ingest: doc -> proc -> index (2), Search: request -> index -> response (2)
      expect(result.edges).toHaveLength(4);
    });

    test('chains multiple ingest processors with edges', () => {
      const config = makeConfig([
        makeProcessor('p1', 'Proc1'),
        makeProcessor('p2', 'Proc2'),
      ]);
      const result = uiConfigToWorkspaceFlow(config);
      // Ingest: doc -> p1 -> p2 -> index (3), Search: request -> index -> response (2)
      expect(result.edges).toHaveLength(5);
    });
  });

  describe('uiConfigToWorkspaceFlow - with search processors', () => {
    test('adds search request processor nodes', () => {
      const config = makeConfig([], [makeProcessor('r1', 'Req Proc')]);
      const result = uiConfigToWorkspaceFlow(config);
      // Ingest: doc -> index (1), Search: request -> r1 -> index -> response (3)
      expect(result.edges).toHaveLength(4);
    });

    test('adds search response processor nodes', () => {
      const config = makeConfig([], [], [makeProcessor('s1', 'Resp Proc')]);
      const result = uiConfigToWorkspaceFlow(config);
      // Ingest: doc -> index (1), Search: request -> index -> s1 -> response (3)
      expect(result.edges).toHaveLength(4);
    });

    test('handles both request and response processors', () => {
      const config = makeConfig(
        [],
        [makeProcessor('r1', 'Req')],
        [makeProcessor('s1', 'Resp')]
      );
      const result = uiConfigToWorkspaceFlow(config);
      // Ingest: doc -> index (1), Search: request -> r1 -> index -> s1 -> response (4)
      expect(result.edges).toHaveLength(5);
    });
  });

  describe('uiConfigToWorkspaceFlow - processor type coverage', () => {
    const processorTypes = [
      PROCESSOR_TYPE.SPLIT,
      PROCESSOR_TYPE.SORT,
      PROCESSOR_TYPE.TEXT_CHUNKING,
      PROCESSOR_TYPE.COPY,
      PROCESSOR_TYPE.NORMALIZATION,
      PROCESSOR_TYPE.COLLAPSE,
      PROCESSOR_TYPE.RERANK,
    ];

    test.each(processorTypes)(
      'creates a transformer node for %s processor type',
      (type) => {
        const config = makeConfig([makeProcessor('p1', 'Proc', type)]);
        const result = uiConfigToWorkspaceFlow(config);
        const transformerNodes = result.nodes.filter(
          (n) => n.data?.type === COMPONENT_CLASS.TRANSFORMER
        );
        expect(transformerNodes).toHaveLength(1);
      }
    );

    test('handles unknown processor type with default transformer', () => {
      const config = makeConfig([
        makeProcessor('p1', 'Unknown', 'unknown_type' as PROCESSOR_TYPE),
      ]);
      const result = uiConfigToWorkspaceFlow(config);
      const transformerNodes = result.nodes.filter(
        (n) => n.data?.type === COMPONENT_CLASS.TRANSFORMER
      );
      expect(transformerNodes).toHaveLength(1);
    });
  });
});
