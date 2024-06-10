/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormikValues } from 'formik';
import { EuiFilterSelectItem } from '@elastic/eui';
import { Schema, ObjectSchema } from 'yup';
import * as yup from 'yup';
import { cloneDeep } from 'lodash';
import { MarkerType } from 'reactflow';
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
  PROCESSOR_TYPE,
} from '../../common';
import {
  Document,
  KnnIndexer,
  MLTransformer,
  NeuralQuery,
  Results,
} from '../component_types';

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

const PARENT_NODE_HEIGHT = 350;
const NODE_HEIGHT_Y = 70;
const NODE_WIDTH = 300; // based off of the value set in reactflow-styles.scss
const NODE_SPACING = 100; // the margin (in # pixels) between the components

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
    nodes: nodes.map((node) => addDefaults(node)),
    edges,
  };
}

// Helper fn for determining the ingest parent width, based on the number of processors and the specified
// spacing/margin between nodes
function generateIngestParentWidth(ingestConfig: IngestConfig): number {
  return (
    (ingestConfig.enrich.processors.length + 2) * (NODE_WIDTH + NODE_SPACING) +
    NODE_SPACING
  );
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
      width: generateIngestParentWidth(ingestConfig),
      height: PARENT_NODE_HEIGHT,
    },
    className: 'reactflow__group-node__ingest',
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // By default, always include a document node and an index node.
  const docNodeId = generateId(COMPONENT_CLASS.DOCUMENT);
  const docNode = {
    id: docNodeId,
    position: { x: 100, y: 70 },
    data: initComponentData(new Document().toObj(), docNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const indexNodeId = generateId(COMPONENT_CLASS.KNN_INDEXER);
  const indexNode = {
    id: indexNodeId,
    position: {
      x: parentNode.style.width - (NODE_WIDTH + NODE_SPACING),
      y: NODE_HEIGHT_Y,
    },
    data: initComponentData(new KnnIndexer().toObj(), indexNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  nodes.push(docNode, indexNode);

  // Get nodes/edges from the sub-configurations
  const enrichWorkspaceFlow = enrichConfigToWorkspaceFlow(
    ingestConfig.enrich,
    parentNode.id
  );

  nodes.push(...enrichWorkspaceFlow.nodes);
  edges.push(...enrichWorkspaceFlow.edges);

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(...getIngestEdges(docNode, enrichWorkspaceFlow, indexNode));

  return {
    nodes,
    edges,
  };
}

// TODO: support non-model-type processor configs
function enrichConfigToWorkspaceFlow(
  enrichConfig: EnrichConfig,
  parentNodeId: string
): WorkspaceFlowState {
  const nodes = [] as ReactFlowComponent[];
  const edges = [] as ReactFlowEdge[];

  let xPosition = NODE_WIDTH + NODE_SPACING * 2; // node padding + (width of doc node) + node padding
  let prevNodeId = undefined as string | undefined;

  const mlProcessorConfigs = enrichConfig.processors.filter(
    (processorConfig) => processorConfig.type === PROCESSOR_TYPE.ML
  ) as IProcessorConfig[];

  mlProcessorConfigs.forEach((mlProcessorConfig) => {
    let transformer = {} as MLTransformer;
    let transformerNodeId = '';
    switch (mlProcessorConfig.type) {
      case PROCESSOR_TYPE.ML:
      default: {
        transformer = new MLTransformer();
        transformerNodeId = generateId(COMPONENT_CLASS.ML_TRANSFORMER);
        break;
      }
    }

    nodes.push({
      id: transformerNodeId,
      position: { x: xPosition, y: NODE_HEIGHT_Y },
      data: initComponentData(transformer, transformerNodeId),
      type: NODE_CATEGORY.CUSTOM,
      parentNode: parentNodeId,
      extent: 'parent',
    });
    xPosition += NODE_SPACING + NODE_WIDTH;

    if (prevNodeId) {
      edges.push(
        generateReactFlowEdge(generateId('edge'), prevNodeId, transformerNodeId)
      );
    }
    prevNodeId = transformerNodeId;
  });
  return {
    nodes,
    edges,
  };
}

// Given the set of localized flows per sub-configuration, generate the global ingest-level edges.
// This takes the assumption the flow is linear, and all sub-configuration flows are fully connected.
function getIngestEdges(
  docNode: ReactFlowComponent,
  enrichFlow: WorkspaceFlowState,
  indexNode: ReactFlowComponent
): ReactFlowEdge[] {
  const startAndEndNodesEnrich = getStartAndEndNodes(enrichFlow);

  // Users may omit search request processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrich !== undefined) {
    const sourceToEnrichEdgeId = generateId('edge');
    const enrichToIndexEdgeId = generateId('edge');

    return [
      generateReactFlowEdge(
        sourceToEnrichEdgeId,
        docNode.id,
        startAndEndNodesEnrich.startNode.id
      ),
      generateReactFlowEdge(
        enrichToIndexEdgeId,
        startAndEndNodesEnrich.endNode.id,
        indexNode.id
      ),
    ] as ReactFlowEdge[];
  } else {
    const sourceToIndexEdgeId = generateId('edge');
    return [
      generateReactFlowEdge(sourceToIndexEdgeId, docNode.id, indexNode.id),
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
      height: PARENT_NODE_HEIGHT,
    },
    className: 'reactflow__group-node__search',
  } as ReactFlowComponent;

  nodes.push(parentNode);

  // By default, always include a query node, an index node, and a results node.
  const queryNodeId = generateId(COMPONENT_CLASS.NEURAL_QUERY);
  const queryNode = {
    id: queryNodeId,
    position: { x: 100, y: 70 },
    data: initComponentData(new NeuralQuery().toObj(), queryNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const indexNodeId = generateId(COMPONENT_CLASS.KNN_INDEXER);
  const indexNode = {
    id: indexNodeId,
    position: { x: 500, y: 70 },
    data: initComponentData(new KnnIndexer().toObj(), indexNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  const resultsNodeId = generateId(COMPONENT_CLASS.RESULTS);
  const resultsNode = {
    id: resultsNodeId,
    position: { x: 900, y: 70 },
    data: initComponentData(new Results().toObj(), resultsNodeId),
    type: NODE_CATEGORY.CUSTOM,
    parentNode: parentNode.id,
    extent: 'parent',
  } as ReactFlowComponent;
  nodes.push(queryNode, indexNode, resultsNode);

  // Get nodes/edges from the sub-configurations
  const enrichRequestWorkspaceFlow = enrichRequestConfigToWorkspaceFlow(
    searchConfig.enrichRequest,
    parentNode.id
  );
  const enrichResponseWorkspaceFlow = enrichResponseConfigToWorkspaceFlow(
    searchConfig.enrichResponse,
    parentNode.id
  );

  nodes.push(
    ...enrichRequestWorkspaceFlow.nodes,
    ...enrichResponseWorkspaceFlow.nodes
  );
  edges.push(
    ...enrichRequestWorkspaceFlow.edges,
    ...enrichResponseWorkspaceFlow.edges
  );

  // Link up the set of localized nodes/edges per sub-workflow
  edges.push(
    ...getSearchEdges(
      queryNode,
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
  queryNode: ReactFlowComponent,
  enrichRequestFlow: WorkspaceFlowState,
  indexNode: ReactFlowComponent,
  enrichResponseFlow: WorkspaceFlowState,
  resultsNode: ReactFlowComponent
): ReactFlowEdge[] {
  const startAndEndNodesEnrichRequest = getStartAndEndNodes(enrichRequestFlow);
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
        generateReactFlowEdge(
          requestToEnrichRequestEdgeId,
          queryNode.id,
          startAndEndNodesEnrichRequest.startNode.id
        ),

        generateReactFlowEdge(
          enrichRequestToIndexEdgeId,
          startAndEndNodesEnrichRequest.endNode.id,
          indexNode.id
        ),
      ] as ReactFlowEdge[])
    );
  } else {
    const requestToIndexEdgeId = generateId('edge');
    edges.push(
      generateReactFlowEdge(requestToIndexEdgeId, queryNode.id, indexNode.id)
    );
  }

  // Users may omit search response processors altogether. Need to handle cases separately.
  if (startAndEndNodesEnrichResponse !== undefined) {
    const indexToEnrichResponseEdgeId = generateId('edge');
    const enrichResponseToResultsEdgeId = generateId('edge');

    edges.push(
      ...([
        generateReactFlowEdge(
          indexToEnrichResponseEdgeId,
          indexNode.id,
          startAndEndNodesEnrichResponse.startNode.id
        ),
        generateReactFlowEdge(
          enrichResponseToResultsEdgeId,
          startAndEndNodesEnrichResponse.endNode.id,
          resultsNode.id
        ),
      ] as ReactFlowEdge[])
    );
  } else {
    const indexToResultsEdgeId = generateId('edge');
    edges.push(
      generateReactFlowEdge(indexToResultsEdgeId, indexNode.id, resultsNode.id)
    );
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

function addDefaults(component: ReactFlowComponent): ReactFlowComponent {
  return {
    ...component,
    draggable: false,
    selectable: false,
    deletable: false,
  };
}

function generateReactFlowEdge(
  id: string,
  source: string,
  target: string
): ReactFlowEdge {
  return {
    id,
    key: id,
    source,
    target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    zIndex: 2,
    deletable: false,
  } as ReactFlowEdge;
}
