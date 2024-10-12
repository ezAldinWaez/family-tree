import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PersonNode from './PersonNode';
import RelationNode from './RelationNode'; // Import RelationNode

import man from './assets/imgs/man.jpg';
import woman from './assets/imgs/woman.jpg';
import son from './assets/imgs/son.jpg';


const initialNodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1', img: man, isAlive: true },
    type: 'custom', // Person node
  },
  {
    id: '2',
    position: { x: 300, y: 0 },
    data: { label: 'Node 2', img: woman, isAlive: false },
    type: 'custom', // Person node
  },
  {
    id: 'relationship-1',
    position: { x: 3 * 55, y: 100 },
    data: { label: 'Marriage', isContinuance: false },
    type: 'relation', // Relationship node
  },
  {
    id: '3',
    position: { x: 20, y: 200 },
    data: { label: 'Node 3', img: son, isAlive: true },
    type: 'custom', // Person node
  },
  {
    id: '4',
    position: { x: 150, y: 200 },
    data: { label: 'Node 4', img: son, isAlive: true },
    type: 'custom', // Person node
  },
  {
    id: '5',
    position: { x: 280, y: 200 },
    data: { label: 'Node 5', img: son, isAlive: true },
    type: 'custom', // Person node
  },
];

const initialEdges = [
  { id: 'e1-relationship', source: '1', target: 'relationship-1' },
  { id: 'e2-relationship', source: '2', target: 'relationship-1' },
  { id: 'relationship-3', source: 'relationship-1', target: '3' },
  { id: 'relationship-4', source: 'relationship-1', target: '4' },
  { id: 'relationship-5', source: 'relationship-1', target: '5' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = {
    custom: PersonNode, // Person node
    relation: RelationNode, // Relationship node
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes} // Pass both node types
      />
    </div>
  );
}
