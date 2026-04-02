/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';
import {
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  PROCESSOR_TYPE,
  WorkflowConfig,
  WorkflowFormValues,
} from '../../common';
import {
  formikToPartialPipeline,
  formikToSearchRequestPipeline,
  formikToSearchPipeline,
} from './form_to_pipeline_utils';

// Mock dependencies
jest.mock('./form_to_config_utils', () => ({
  formikToUiConfig: jest.fn((_values, config) => config),
}));

jest.mock('./config_to_template_utils', () => ({
  processorConfigsToTemplateProcessors: jest.fn((processors) =>
    processors.map((p: IProcessorConfig) => ({ [p.type]: {} }))
  ),
}));

const makeProcessor = (
  id: string,
  type: PROCESSOR_TYPE = PROCESSOR_TYPE.ML
): IProcessorConfig => ({
  id,
  name: id,
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
      pipelineName: { id: 'pipelineName', type: 'string', value: '' },
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
      pipelineName: { id: 'pipelineName', type: 'string', value: '' },
      enrichRequest: { processors: requestProcessors },
      enrichResponse: { processors: responseProcessors },
    },
  } as unknown as WorkflowConfig);

const FORM_VALUES: WorkflowFormValues = {
  ingest: {},
  search: {},
} as WorkflowFormValues;

describe('form_to_pipeline_utils', () => {
  describe('formikToPartialPipeline', () => {
    test('returns undefined when values is missing ingest or search', () => {
      expect(
        formikToPartialPipeline(
          {} as WorkflowFormValues,
          makeConfig(),
          'p1',
          false,
          PROCESSOR_CONTEXT.INGEST
        )
      ).toBeUndefined();
    });

    test('returns undefined when no preceding ingest processors', () => {
      const config = makeConfig([makeProcessor('p1')]);
      expect(
        formikToPartialPipeline(
          FORM_VALUES,
          config,
          'p1',
          false,
          PROCESSOR_CONTEXT.INGEST
        )
      ).toBeUndefined();
    });

    test('returns ingest pipeline with preceding processors', () => {
      const config = makeConfig([
        makeProcessor('p1'),
        makeProcessor('p2'),
        makeProcessor('p3'),
      ]);
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'p3',
        false,
        PROCESSOR_CONTEXT.INGEST
      );
      expect(result).toBeDefined();
      expect((result as any).processors).toHaveLength(2);
    });

    test('includes current processor when includeCurProcessor is true', () => {
      const config = makeConfig([makeProcessor('p1'), makeProcessor('p2')]);
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'p2',
        true,
        PROCESSOR_CONTEXT.INGEST
      );
      expect((result as any).processors).toHaveLength(2);
    });

    test('returns search request pipeline with preceding processors', () => {
      const config = makeConfig(
        [],
        [makeProcessor('r1'), makeProcessor('r2')],
        []
      );
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'r2',
        false,
        PROCESSOR_CONTEXT.SEARCH_REQUEST
      );
      expect(result).toBeDefined();
      expect((result as any).request_processors).toHaveLength(1);
    });

    test('returns undefined for search request with no preceding processors', () => {
      const config = makeConfig([], [makeProcessor('r1')], []);
      expect(
        formikToPartialPipeline(
          FORM_VALUES,
          config,
          'r1',
          false,
          PROCESSOR_CONTEXT.SEARCH_REQUEST
        )
      ).toBeUndefined();
    });

    test('returns search response pipeline separating phase_results and response processors', () => {
      const normProcessor = makeProcessor(
        'norm1',
        PROCESSOR_TYPE.NORMALIZATION
      );
      const mlProcessor = makeProcessor('ml1', PROCESSOR_TYPE.ML);
      const config = makeConfig(
        [],
        [makeProcessor('req1')],
        [normProcessor, mlProcessor, makeProcessor('target')]
      );
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'target',
        false,
        PROCESSOR_CONTEXT.SEARCH_RESPONSE
      );
      expect(result).toBeDefined();
      expect((result as any).request_processors).toBeDefined();
      expect((result as any).phase_results_processors).toHaveLength(1);
      expect((result as any).response_processors).toHaveLength(1);
    });

    test('returns search response pipeline when only request processors exist', () => {
      const config = makeConfig(
        [],
        [makeProcessor('req1')],
        [makeProcessor('resp1')]
      );
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'resp1',
        false,
        PROCESSOR_CONTEXT.SEARCH_RESPONSE
      );
      expect(result).toBeDefined();
      expect((result as any).request_processors).toBeDefined();
    });

    test('returns search response pipeline when request processors exist but no preceding response processors', () => {
      const config = makeConfig(
        [],
        [makeProcessor('req1')],
        [makeProcessor('resp1')]
      );
      const result = formikToPartialPipeline(
        FORM_VALUES,
        config,
        'resp1',
        false,
        PROCESSOR_CONTEXT.SEARCH_RESPONSE
      );
      expect(result).toBeDefined();
      expect((result as any).response_processors).toHaveLength(0);
      expect((result as any).request_processors).toHaveLength(1);
    });
  });

  describe('formikToSearchRequestPipeline', () => {
    test('returns undefined when no request processors', () => {
      expect(
        formikToSearchRequestPipeline(FORM_VALUES, makeConfig())
      ).toBeUndefined();
    });

    test('returns pipeline with request processors', () => {
      const config = makeConfig([], [makeProcessor('r1')], []);
      const result = formikToSearchRequestPipeline(FORM_VALUES, config);
      expect(result).toBeDefined();
      expect((result as any).request_processors).toHaveLength(1);
    });

    test('returns undefined when values missing ingest or search', () => {
      expect(
        formikToSearchRequestPipeline(
          {} as WorkflowFormValues,
          makeConfig([], [makeProcessor('r1')])
        )
      ).toBeUndefined();
    });
  });

  describe('formikToSearchPipeline', () => {
    test('returns undefined when no processors', () => {
      expect(
        formikToSearchPipeline(FORM_VALUES, makeConfig())
      ).toBeUndefined();
    });

    test('returns pipeline with request processors only', () => {
      const config = makeConfig([], [makeProcessor('r1')], []);
      const result = formikToSearchPipeline(FORM_VALUES, config);
      expect(result).toBeDefined();
      expect((result as any).request_processors).toHaveLength(1);
      expect((result as any).response_processors).toHaveLength(0);
      expect((result as any).phase_results_processors).toHaveLength(0);
    });

    test('returns pipeline with response processors only', () => {
      const config = makeConfig([], [], [makeProcessor('resp1')]);
      const result = formikToSearchPipeline(FORM_VALUES, config);
      expect(result).toBeDefined();
      expect((result as any).response_processors).toHaveLength(1);
    });

    test('separates normalization into phase_results_processors', () => {
      const config = makeConfig(
        [],
        [],
        [
          makeProcessor('norm1', PROCESSOR_TYPE.NORMALIZATION),
          makeProcessor('ml1', PROCESSOR_TYPE.ML),
        ]
      );
      const result = formikToSearchPipeline(FORM_VALUES, config);
      expect(result).toBeDefined();
      expect((result as any).phase_results_processors).toHaveLength(1);
      expect((result as any).response_processors).toHaveLength(1);
    });

    test('returns undefined when values missing ingest or search', () => {
      expect(
        formikToSearchPipeline({} as WorkflowFormValues, makeConfig())
      ).toBeUndefined();
    });
  });
});
