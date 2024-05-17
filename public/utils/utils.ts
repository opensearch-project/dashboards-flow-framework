/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { EuiFilterSelectItem } from '@elastic/eui';
import { Schema, ObjectSchema } from 'yup';
import * as yup from 'yup';
import { cloneDeep } from 'lodash';
import {
  IComponent,
  IComponentData,
  WORKFLOW_STATE,
  Workflow,
  WorkflowTemplate,
  ModelFormValue,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowSchema,
  IngestConfig,
  SearchConfig,
  EnrichConfig,
  ConfigFieldType,
  ConfigFieldValue,
  WorkflowSchemaObj,
  IConfigField,
  IndexConfig,
  IProcessorConfig,
  WorkspaceFlowState,
  ReactFlowEdge,
  ReactFlowComponent,
  COMPONENT_CLASS,
  COMPONENT_CATEGORY,
  NODE_CATEGORY,
  IConfig,
  IModelProcessorConfig,
  PROCESSOR_TYPE,
  MODEL_TYPE,
} from '../../common';
import {
  Document,
  KnnIndexer,
  MLTransformer,
  NeuralQuery,
  Results,
  SparseEncoderTransformer,
  TextEmbeddingTransformer,
} from '../component_types';
import { MarkerType } from 'reactflow';

// Append 16 random characters
export function generateId(prefix: string): string {
  const uniqueChar = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${prefix}_${uniqueChar()}${uniqueChar()}${uniqueChar()}${uniqueChar()}`;
}

// Adding any instance metadata. Converting the base IComponent obj into
// an instance-specific IComponentData obj.
export function initComponentData(
  data: IComponent,
  componentId: string
): IComponentData {
  return {
    ...data,
    id: componentId,
  } as IComponentData;
}

/*
 **************** Formik / form utils **********************
 */

export function uiConfigToFormik(config: WorkflowConfig): WorkflowFormValues {
  const formikValues = {} as WorkflowFormValues;
  formikValues['ingest'] = ingestConfigToFormik(config.ingest);
  formikValues['search'] = searchConfigToFormik(config.search);
  return formikValues;
}

function ingestConfigToFormik(
  ingestConfig: IngestConfig | undefined
): FormikValues {
  let ingestFormikValues = {} as FormikValues;
  if (ingestConfig) {
    ingestFormikValues['enrich'] = enrichConfigToFormik(ingestConfig.enrich);
    ingestFormikValues['index'] = indexConfigToFormik(ingestConfig.index);
  }
  return ingestFormikValues;
}

function enrichConfigToFormik(enrichConfig: EnrichConfig): FormikValues {
  let formValues = {} as FormikValues;

  enrichConfig.processors.forEach((processorConfig) => {
    formValues[processorConfig.id] = processorConfigToFormik(processorConfig);
  });
  return formValues;
}

export function processorConfigToFormik(
  processorConfig: IProcessorConfig
): FormikValues {
  const fieldValues = {} as FormikValues;
  processorConfig.fields.forEach((field) => {
    fieldValues[field.id] = field.value || getInitialValue(field.type);
  });
  return fieldValues;
}

function indexConfigToFormik(indexConfig: IndexConfig): FormikValues {
  let formValues = {} as FormikValues;
  formValues['name'] =
    indexConfig.name.value || getInitialValue(indexConfig.name.type);
  return formValues;
}

// TODO: implement this
function searchConfigToFormik(
  searchConfig: SearchConfig | undefined
): FormikValues {
  let searchFormikValues = {} as FormikValues;
  return searchFormikValues;
}

// Injecting all of the form values into the config
export function formikToUiConfig(
  formValues: WorkflowFormValues,
  existingConfig: WorkflowConfig
): WorkflowConfig {
  let updatedConfig = cloneDeep(existingConfig);
  updatedConfig['ingest'] = formikToIngestUiConfig(
    formValues.ingest,
    updatedConfig.ingest
  );
  updatedConfig['search'] = {} as SearchConfig;

  return {
    ...updatedConfig,
    ingest: formikToIngestUiConfig(formValues.ingest, updatedConfig.ingest),
  };
}

function formikToIngestUiConfig(
  ingestFormValues: FormikValues,
  existingConfig: IngestConfig
): IngestConfig {
  return {
    ...existingConfig,
    enrich: formikToEnrichUiConfig(
      ingestFormValues['enrich'],
      existingConfig.enrich
    ),
    index: formikToIndexUiConfig(
      ingestFormValues['index'],
      existingConfig.index
    ),
  };
}

function formikToEnrichUiConfig(
  enrichFormValues: FormikValues,
  existingConfig: EnrichConfig
): EnrichConfig {
  existingConfig.processors.forEach((processorConfig) => {
    const processorFormValues = enrichFormValues[processorConfig.id];
    processorConfig.fields.forEach((processorField) => {
      processorField.value = processorFormValues[processorField.id];
    });
  });
  return existingConfig;
}

function formikToIndexUiConfig(
  indexFormValues: FormikValues,
  existingConfig: IndexConfig
): IndexConfig {
  existingConfig['name'].value = indexFormValues['name'];
  return existingConfig;
}

/*
 **************** Schema / validation utils **********************
 */

export function uiConfigToSchema(config: WorkflowConfig): WorkflowSchema {
  const schemaObj = {} as WorkflowSchemaObj;
  schemaObj['ingest'] = ingestConfigToSchema(config.ingest);
  schemaObj['search'] = searchConfigToSchema(config.search);
  return yup.object(schemaObj) as WorkflowSchema;
}

function ingestConfigToSchema(
  ingestConfig: IngestConfig | undefined
): ObjectSchema<any> {
  const ingestSchemaObj = {} as { [key: string]: Schema };
  if (ingestConfig) {
    // TODO: implement for the other sub-categories
    ingestSchemaObj['enrich'] = enrichConfigToSchema(ingestConfig.enrich);
    ingestSchemaObj['index'] = indexConfigToSchema(ingestConfig.index);
  }
  return yup.object(ingestSchemaObj);
}

function enrichConfigToSchema(enrichConfig: EnrichConfig): Schema {
  const enrichSchemaObj = {} as { [key: string]: Schema };
  enrichConfig.processors.forEach((processorConfig) => {
    const processorSchemaObj = {} as { [key: string]: Schema };
    processorConfig.fields.forEach((field) => {
      processorSchemaObj[field.id] = getFieldSchema(field);
    });
    enrichSchemaObj[processorConfig.id] = yup.object(processorSchemaObj);
  });

  return yup.object(enrichSchemaObj);
}

function indexConfigToSchema(indexConfig: IndexConfig): Schema {
  const indexSchemaObj = {} as { [key: string]: Schema };
  indexSchemaObj['name'] = getFieldSchema(indexConfig.name);
  return yup.object(indexSchemaObj);
}

// TODO: implement this
function searchConfigToSchema(
  searchConfig: SearchConfig | undefined
): ObjectSchema<any> {
  const searchSchemaObj = {} as { [key: string]: Schema };

  return yup.object(searchSchemaObj);
}

// Helper fn to remove state-related fields from a workflow and have a stateless template
// to export and/or pass around, use when updating, etc.
export function reduceToTemplate(workflow: Workflow): WorkflowTemplate {
  const {
    id,
    lastUpdated,
    lastLaunched,
    state,
    resourcesCreated,
    ...workflowTemplate
  } = workflow;
  return workflowTemplate;
}

// Helper fn to get an initial value based on the field type
export function getInitialValue(fieldType: ConfigFieldType): ConfigFieldValue {
  switch (fieldType) {
    case 'string': {
      return '';
    }
    case 'select': {
      return '';
    }
    case 'model': {
      return {
        id: '',
        category: undefined,
        algorithm: undefined,
      } as ModelFormValue;
    }
    case 'json': {
      return {};
    }
  }
}

/*
 **************** Yup (validation) utils **********************
 */

function getFieldSchema(field: IConfigField): Schema {
  let baseSchema: Schema;
  switch (field.type) {
    case 'string':
    case 'select': {
      baseSchema = yup.string().min(1, 'Too short').max(70, 'Too long');
      break;
    }
    case 'model': {
      baseSchema = yup.object().shape({
        id: yup.string().min(1, 'Too short').max(70, 'Too long').required(),
        category: yup.string().required(),
      });
      break;
    }
    case 'json': {
      baseSchema = yup.object().json();
      break;
    }
  }

  // TODO: make optional schema if we support optional fields in the future
  // return field.optional
  //   ? baseSchema.optional()
  //   : baseSchema.required('Required');

  return baseSchema.required('Required');
}

export function getStateOptions(): EuiFilterSelectItem[] {
  return [
    // @ts-ignore
    {
      name: WORKFLOW_STATE.NOT_STARTED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.PROVISIONING,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.FAILED,
      checked: 'on',
    } as EuiFilterSelectItem,
    // @ts-ignore
    {
      name: WORKFLOW_STATE.COMPLETED,
      checked: 'on',
    } as EuiFilterSelectItem,
  ];
}

/*
 **************** ReactFlow workspace utils **********************
 */

export function uiConfigToWorkspaceFlow(
  config: WorkflowConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  const ingestWorkspaceFlow = ingestConfigToWorkspaceFlow(config.ingest);
  nodes.push(...ingestWorkspaceFlow.nodes);
  edges.push(...ingestWorkspaceFlow.edges);

  const searchWorkspaceFlow = searchConfigToWorkspaceFlow(config.search);
  nodes.push(...searchWorkspaceFlow.nodes);
  edges.push(...searchWorkspaceFlow.edges);

  return {
    nodes,
    edges,
  };
}

function ingestConfigToWorkspaceFlow(
  ingestConfig: IngestConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  // Parent ingest node
  const parentNode = {
    id: generateId(COMPONENT_CATEGORY.INGEST),
    position: { x: 400, y: 400 },
    type: NODE_CATEGORY.INGEST_GROUP,
    data: { label: COMPONENT_CATEGORY.INGEST },
    style: {
      width: 1300,
      height: 400,
    },
    className: 'reactflow__group-node__ingest',
    selectable: false,
    draggable: false,
    deletable: false,
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // Get nodes/edges from the sub-configurations
  const sourceWorkspaceFlow = sourceConfigToWorkspaceFlow(
    ingestConfig.source,
    parentNode.id
  );
  const enrichWorkspaceFlow = enrichConfigToWorkspaceFlow(
    ingestConfig.enrich,
    parentNode.id
  );
  const indexWorkspaceFlow = indexConfigToWorkspaceFlow(
    ingestConfig.index,
    parentNode.id
  );

  nodes.push(
    ...sourceWorkspaceFlow.nodes,
    ...enrichWorkspaceFlow.nodes,
    ...indexWorkspaceFlow.nodes
  );
  edges.push(
    ...sourceWorkspaceFlow.edges,
    ...enrichWorkspaceFlow.edges,
    ...indexWorkspaceFlow.edges
  );

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(
    ...getIngestEdges(
      sourceWorkspaceFlow,
      enrichWorkspaceFlow,
      indexWorkspaceFlow
    )
  );

  return {
    nodes,
    edges,
  };
}

// TODO: make more generic.
// Currently hardcoding a single Document node as the source.
function sourceConfigToWorkspaceFlow(
  sourceConfig: IConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  const docNodeId = generateId(COMPONENT_CLASS.DOCUMENT);
  nodes.push({
    id: docNodeId,
    position: { x: 100, y: 70 },
    data: initComponentData(new Document().toObj(), docNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNodeId,
    extent: 'parent',
    draggable: true,
    deletable: false,
  });

  return {
    nodes,
    edges,
  };
}

function enrichConfigToWorkspaceFlow(
  enrichConfig: EnrichConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  // TODO: few assumptions are made here, such as there will always be
  // a single model-related processor. In the future make this more flexible and generic.
  const modelProcessorConfig = enrichConfig.processors.find(
    (processorConfig) => processorConfig.type === PROCESSOR_TYPE.MODEL
  ) as IModelProcessorConfig;

  let transformer = {} as MLTransformer;
  let transformerNodeId = '';
  switch (modelProcessorConfig.modelType) {
    case MODEL_TYPE.TEXT_EMBEDDING: {
      transformer = new TextEmbeddingTransformer();
      transformerNodeId = generateId(
        COMPONENT_CLASS.TEXT_EMBEDDING_TRANSFORMER
      );
      break;
    }
    case MODEL_TYPE.SPARSE_ENCODER: {
      transformer = new SparseEncoderTransformer();
      transformerNodeId = generateId(
        COMPONENT_CLASS.SPARSE_ENCODER_TRANSFORMER
      );
      break;
    }
  }

  nodes.push({
    id: transformerNodeId,
    position: { x: 500, y: 70 },
    data: initComponentData(transformer, transformerNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNodeId,
    extent: 'parent',
    draggable: true,
    deletable: false,
  });
  return {
    nodes,
    edges,
  };
}

function indexConfigToWorkspaceFlow(
  indexConfig: IndexConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  const indexNodeId = generateId(COMPONENT_CLASS.KNN_INDEXER);
  nodes.push({
    id: indexNodeId,
    position: { x: 900, y: 70 },
    data: initComponentData(new KnnIndexer().toObj(), indexNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNodeId,
    extent: 'parent',
    draggable: true,
    deletable: false,
  });

  return {
    nodes,
    edges,
  };
}

// Given the set of localized flows per sub-configuration, generate the global ingest-level edges.
// This takes the assumption the flow is linear, and all sub-configuration flows are fully connected.
function getIngestEdges(
  sourceFlow: WorkspaceFlowState,
  enrichFlow: WorkspaceFlowState,
  indexFlow: WorkspaceFlowState
): ReactFlowEdge[] {
  const startAndEndNodesSource = getStartAndEndNodes(sourceFlow) as {
    startNode: ReactFlowComponent;
    endNode: ReactFlowComponent;
  };
  // May be undefined if no ingest processors defined
  const startAndEndNodesEnrich = getStartAndEndNodes(enrichFlow);
  const startAndEndNodesIndex = getStartAndEndNodes(indexFlow) as {
    startNode: ReactFlowComponent;
    endNode: ReactFlowComponent;
  };

  // Users may omit search request processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrich !== undefined) {
    const sourceToEnrichEdgeId = generateId('edge');
    const enrichToIndexEdgeId = generateId('edge');

    return [
      {
        id: sourceToEnrichEdgeId,
        key: sourceToEnrichEdgeId,
        source: startAndEndNodesSource.endNode.id,
        target: startAndEndNodesEnrich.startNode.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        zIndex: 2,
        deletable: false,
      },
      {
        id: enrichToIndexEdgeId,
        key: enrichToIndexEdgeId,
        source: startAndEndNodesEnrich.endNode.id,
        target: startAndEndNodesIndex.startNode.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        zIndex: 2,
        deletable: false,
      },
    ] as ReactFlowEdge[];
  } else {
    const sourceToIndexEdgeId = generateId('edge');
    return [
      {
        id: sourceToIndexEdgeId,
        key: sourceToIndexEdgeId,
        source: startAndEndNodesSource.endNode.id,
        target: startAndEndNodesIndex.startNode.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        zIndex: 2,
        deletable: false,
      },
    ] as ReactFlowEdge[];
  }
}

function searchConfigToWorkspaceFlow(
  searchConfig: SearchConfig
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  // Parent search node
  const parentNode = {
    id: generateId(COMPONENT_CATEGORY.SEARCH),
    position: { x: 400, y: 1000 },
    type: NODE_CATEGORY.SEARCH_GROUP,
    data: { label: COMPONENT_CATEGORY.SEARCH },
    style: {
      width: 1300,
      height: 400,
    },
    className: 'reactflow__group-node__search',
    selectable: true,
    draggable: true,
    deletable: false,
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // By default, always include an index node and a results node.
  const indexNodeId = generateId(COMPONENT_CLASS.KNN_INDEXER);
  const indexNode = {
    id: indexNodeId,
    position: { x: 500, y: 70 },
    data: initComponentData(new KnnIndexer().toObj(), indexNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
    draggable: true,
    deletable: false,
  } as ReactFlowComponent;
  const resultsNodeId = generateId(COMPONENT_CLASS.RESULTS);
  const resultsNode = {
    id: resultsNodeId,
    position: { x: 900, y: 70 },
    data: initComponentData(new Results().toObj(), resultsNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
    draggable: true,
    deletable: false,
  } as ReactFlowComponent;
  nodes.push(indexNode, resultsNode);

  // Get nodes/edges from the sub-configurations
  const requestWorkspaceFlow = requestConfigToWorkspaceFlow(
    searchConfig.request,
    parentNode.id
  );
  const enrichRequestWorkspaceFlow = enrichRequestConfigToWorkspaceFlow(
    searchConfig.enrichRequest,
    parentNode.id
  );
  const enrichResponseWorkspaceFlow = enrichResponseConfigToWorkspaceFlow(
    searchConfig.enrichResponse,
    parentNode.id
  );

  nodes.push(
    ...requestWorkspaceFlow.nodes,
    ...enrichRequestWorkspaceFlow.nodes,
    ...enrichResponseWorkspaceFlow.nodes
  );
  edges.push(
    ...requestWorkspaceFlow.edges,
    ...enrichRequestWorkspaceFlow.edges,
    ...enrichResponseWorkspaceFlow.edges
  );

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(
    ...getSearchEdges(
      requestWorkspaceFlow,
      enrichRequestWorkspaceFlow,
      indexNode,
      enrichResponseWorkspaceFlow,
      resultsNode
    )
  );

  return {
    nodes,
    edges,
  };
}

// TODO: make more generic.
// Currently hardcoding a single NeuralQuery node as the source.
function requestConfigToWorkspaceFlow(
  requestConfig: IConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  const queryNodeId = generateId(COMPONENT_CLASS.NEURAL_QUERY);
  nodes.push({
    id: queryNodeId,
    position: { x: 100, y: 70 },
    data: initComponentData(new NeuralQuery().toObj(), queryNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNodeId,
    extent: 'parent',
    draggable: true,
    deletable: false,
  });

  return {
    nodes,
    edges,
  };
}

// TODO: implement this
function enrichRequestConfigToWorkspaceFlow(
  enrichConfig: IConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  return {
    nodes,
    edges,
  };
}

// TODO: implement this
function enrichResponseConfigToWorkspaceFlow(
  enrichResponseConfig: IConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  return {
    nodes,
    edges,
  };
}

// Given the set of localized flows per sub-configuration, generate the global search-level edges.
// This takes the assumption the flow is linear, and all sub-configuration flows are fully connected.
function getSearchEdges(
  requestFlow: WorkspaceFlowState,
  enrichRequestFlow: WorkspaceFlowState,
  indexNode: ReactFlowComponent,
  enrichResponseFlow: WorkspaceFlowState,
  resultsNode: ReactFlowComponent
): ReactFlowEdge[] {
  const startAndEndNodesRequest = getStartAndEndNodes(requestFlow) as {
    startNode: ReactFlowComponent;
    endNode: ReactFlowComponent;
  };
  // May be undefined if no search request processors defined
  const startAndEndNodesEnrichRequest = getStartAndEndNodes(enrichRequestFlow);
  // May be undefined if no search response processors defined
  const startAndEndNodesEnrichResponse = getStartAndEndNodes(
    enrichResponseFlow
  );
  const edges = [] as ReactFlowEdge[];

  // Users may omit search request processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrichRequest !== undefined) {
    const requestToEnrichRequestEdgeId = generateId('edge');
    const enrichRequestToIndexEdgeId = generateId('edge');
    edges.push(
      ...([
        {
          id: requestToEnrichRequestEdgeId,
          key: requestToEnrichRequestEdgeId,
          source: startAndEndNodesRequest?.endNode.id,
          target: startAndEndNodesEnrichRequest.startNode.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          zIndex: 2,
          deletable: false,
        },
        {
          id: enrichRequestToIndexEdgeId,
          key: enrichRequestToIndexEdgeId,
          source: startAndEndNodesEnrichRequest.endNode.id,
          target: indexNode.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          zIndex: 2,
          deletable: false,
        },
      ] as ReactFlowEdge[])
    );
  } else {
    const requestToIndexEdgeId = generateId('edge');
    edges.push({
      id: requestToIndexEdgeId,
      key: requestToIndexEdgeId,
      source: startAndEndNodesRequest?.endNode.id,
      target: indexNode.id,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      zIndex: 2,
      deletable: false,
    } as ReactFlowEdge);
  }

  // Users may omit search response processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrichResponse !== undefined) {
    const indexToEnrichResponseEdgeId = generateId('edge');
    const enrichResponseToResultsEdgeId = generateId('edge');

    edges.push(
      ...([
        {
          id: indexToEnrichResponseEdgeId,
          key: indexToEnrichResponseEdgeId,
          source: indexNode.id,
          target: startAndEndNodesEnrichResponse.startNode.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          zIndex: 2,
          deletable: false,
        },
        {
          id: enrichResponseToResultsEdgeId,
          key: enrichResponseToResultsEdgeId,
          source: startAndEndNodesEnrichResponse.endNode.id,
          target: resultsNode.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          zIndex: 2,
          deletable: false,
        },
      ] as ReactFlowEdge[])
    );
  } else {
    const indexToResultsEdgeId = generateId('edge');
    edges.push({
      id: indexToResultsEdgeId,
      key: indexToResultsEdgeId,
      source: indexNode.id,
      target: resultsNode.id,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      zIndex: 2,
      deletable: false,
    } as ReactFlowEdge);
  }

  return edges;
}

// Get start and end nodes in a flow. This assumes the flow is linear and fully connected,
// such that there will always be a single start and single end node.
function getStartAndEndNodes(
  workspaceFlow: WorkspaceFlowState
):
  | {
      startNode: ReactFlowComponent;
      endNode: ReactFlowComponent;
    }
  | undefined {
  if (workspaceFlow.nodes.length === 0) {
    return undefined;
  }
  if (workspaceFlow.nodes.length === 1) {
    return {
      startNode: workspaceFlow.nodes[0],
      endNode: workspaceFlow.nodes[0],
    };
  }

  const nodeIdsWithTarget = workspaceFlow.edges.map((edge) => edge.target);
  const nodeIdsWithSource = workspaceFlow.edges.map((edge) => edge.source);

  return {
    startNode: workspaceFlow.nodes.filter(
      (node) => !nodeIdsWithTarget.includes(node.id)
    )[0],
    endNode: workspaceFlow.nodes.filter(
      (node) => !nodeIdsWithSource.includes(node.id)
    )[0],
  };
}
