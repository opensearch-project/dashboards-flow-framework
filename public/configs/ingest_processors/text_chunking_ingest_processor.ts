/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PROCESSOR_TYPE, TEXT_CHUNKING_ALGORITHM } from '../../../common';
import { generateId } from '../../utils';
import { Processor } from '../processor';

/**
 * The text chunking ingest processor
 */
export class TextChunkingIngestProcessor extends Processor {
  constructor() {
    super();
    this.name = 'Text Chunking Processor';
    this.type = PROCESSOR_TYPE.TEXT_CHUNKING;
    this.id = generateId('text_chunking_processor_ingest');
    this.fields = [
      {
        id: 'field_map',
        type: 'map',
      },
      {
        id: 'algorithm',
        type: 'select',
        selectOptions: [
          TEXT_CHUNKING_ALGORITHM.FIXED_TOKEN_LENGTH,
          TEXT_CHUNKING_ALGORITHM.DELIMITER,
        ],
      },
    ];
    // optional params include all of those possible from both text chunking algorithms.
    // for more details, see https://opensearch.org/docs/latest/ingest-pipelines/processors/text-chunking/
    // the list of optional params per algorithm and shared across algorithms is persisted in
    // common/constants.ts
    this.optionalFields = [
      // fixed_token_length optional params
      {
        id: 'token_limit',
        type: 'number',
        value: 384,
      },
      {
        id: 'tokenizer',
        type: 'string',
        value: 'standard',
      },
      {
        id: 'overlap_rate',
        type: 'number',
        value: 0,
      },
      // delimiter optional params
      {
        id: 'delimiter',
        type: 'string',
      },
      // shared optional params (independent of algorithm)
      {
        id: 'max_chunk_limit',
        type: 'number',
        value: 100,
      },
      {
        id: 'description',
        type: 'string',
      },
      {
        id: 'tag',
        type: 'string',
      },
      {
        id: 'ignore_missing',
        type: 'boolean',
        value: false,
      },
    ];
  }
}
