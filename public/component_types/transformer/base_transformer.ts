/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CLASS, PROCESSOR_CONTEXT } from '../../../common';
import { BaseComponent } from '../base_component';

/**
 * A base transformer UI component representing ingest / search req / search resp processors.
 * Input/output descriptions depends on the processor context (ingest, search request, or search response)
 */
export class BaseTransformer extends BaseComponent {
  constructor(label: string, description: string, context: PROCESSOR_CONTEXT) {
    super();
    this.type = COMPONENT_CLASS.TRANSFORMER;
    this.label = label;
    this.description = description;
    this.inputs = [
      {
        id:
          context === PROCESSOR_CONTEXT.INGEST
            ? 'document'
            : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? 'search_request'
            : 'search_response',
        label:
          context === PROCESSOR_CONTEXT.INGEST
            ? 'Document'
            : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? 'Search Request'
            : 'Search Response',
        acceptMultiple: false,
      },
    ];
    this.outputs = [
      {
        id:
          context === PROCESSOR_CONTEXT.INGEST
            ? 'document'
            : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? 'search_request'
            : 'search_response',
        label:
          context === PROCESSOR_CONTEXT.INGEST
            ? 'Document'
            : context === PROCESSOR_CONTEXT.SEARCH_REQUEST
            ? 'Search Request'
            : 'Search Response',
      },
    ];
  }
}
