import { PROCESSOR_TYPE } from '../../../common';
import { generateId } from '../../utils';
import { Processor } from '../processor';

export class TextEmbeddingIngestProcessor extends Processor {
  constructor() {
    super();
    this.name = 'Text Embedding Processor';
    this.type = PROCESSOR_TYPE.TEXT_EMBEDDING;
    this.id = generateId('text_embedding_processor_ingest');
    this.fields = [
      {
        id: 'model',
        type: 'model',
      },
      {
        id: 'field_map',
        type: 'map',
      },
    ];
    this.optionalFields = [
      {
        id: 'description',
        type: 'textArea',
      },
      {
        id: 'tag',
        type: 'string',
      },
      {
        id: 'batch_size',
        type: 'number',
        value: 1,
      },
    ];
  }
}
