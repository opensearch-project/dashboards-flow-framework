/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Node, Edge } from 'reactflow';
import { IComponent } from '../public/component_types';

/**
 * TODO: remove hardcoded nodes/edges.
 *
 * Converts the stored IComponents into the low-level ReactFlow nodes and edges.
 * This may change entirely, depending on how/where the ReactFlow JSON will be
 * persisted. Using this stub helper fn in the meantime.
 */
export function convertToReactFlowData(components: IComponent[]) {
  const dummyNodes = [
    {
      id: 'semantic-search',
      position: { x: 40, y: 10 },
      data: { label: 'Semantic Search' },
      type: 'group',
      style: {
        height: 110,
        width: 700,
      },
    },
    {
      id: 'model',
      position: { x: 25, y: 25 },
      data: { label: 'Deployed Model ID' },
      type: 'default',
      parentNode: 'semantic-search',
      extent: 'parent',
    },
    {
      id: 'ingest-pipeline',
      position: { x: 262, y: 25 },
      data: { label: 'Ingest Pipeline Name' },
      type: 'default',
      parentNode: 'semantic-search',
      extent: 'parent',
    },
  ] as Array<
    Node<
      {
        label: string;
      },
      string | undefined
    >
  >;

  const dummyEdges = [
    {
      id: 'e1-2',
      source: 'model',
      target: 'ingest-pipeline',
      style: {
        strokeWidth: 2,
        stroke: 'black',
      },
      markerEnd: {
        type: 'arrow',
        strokeWidth: 1,
        color: 'black',
      },
    },
  ] as Array<Edge<any>>;

  return {
    rfNodes: dummyNodes,
    rfEdges: dummyEdges,
  };
}
