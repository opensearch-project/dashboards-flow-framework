import { PROCESSOR_TYPE } from '../../../common';
import { generateId } from '../../utils';
import { Processor } from '../processor';

export class TextImageEmbeddingIngestProcessor extends Processor {
  constructor() {
    super();
    this.name = 'Text Image Embedding Processor';
    this.type = PROCESSOR_TYPE.TEXT_IMAGE_EMBEDDING;
    this.id = generateId('text_image_embedding_processor_ingest');
    this.fields = [
      {
        id: 'model',
        type: 'model',
      },
      {
        id: 'embedding',
        type: 'string',
      },
      {
        id: 'field_map',
        type: 'map',
      },
    ];
    this.optionalFields = [
      {
        id: 'description',
        type: 'string',
      },
      {
        id: 'tag',
        type: 'string',
      },
    ];
  }
}
