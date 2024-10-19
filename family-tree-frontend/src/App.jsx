import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
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
    position: { x: 100, y: 0 },
    data: { label: 'Node 1', img: man, isAlive: true, name: 'Alzobair'},
    draggable: false,
    type: 'custom', // Person node
    markerStart: null,
  },
  {
    id: '2',
    position: { x: 200, y: 0 },
    data: { label: 'Node 2', img: woman, isAlive: true, name: 'Afraa'},
    draggable: false,
    type: 'custom', // Person node
  },
  {
    id: 'relationship-1',
    position: { x: 3 * 55, y: 0 },
    data: { label: 'Marriage', isContinuance: true },
    draggable: false,
    type: 'relation', // Relationship node
  },
  {
    id: '3',
    position: { x: 0, y: 200 },
    data: { label: 'Node 3', img: son, isAlive: true, name: 'Fatimah' },
    draggable: false,
    type: 'custom', // Person node
  },
  {
    id: '4',
    position: { x: 75, y: 200 },
    data: { label: 'Node 4', img: son, isAlive: true, name: 'Shaima\'a' },
    draggable: false,
    type: 'custom', // Person node
  },
  {
    id: '5',
    position: { x: 150, y: 200 },
    data: { label: 'Node 5', img: son, isAlive: true, name: 'Mohammad' },
    draggable: false,
    type: 'custom', // Person node
  },
  {
    id: '6',
    position: { x: 225, y: 200 },
    data: { label: 'Node 5', img: son, isAlive: true, name: 'Abdo Allah' },
    draggable: false,
    type: 'custom', // Person node
  },
  {
    id: '7',
    position: { x: 300, y: 200 },
    data: { label: 'Node 5', img: son, isAlive: true, name: 'Alaa' },
    draggable: false,
    type: 'custom', // Person node
  },
];

const initialEdges = [
  { id: 'e1-relationship', source: '1', target: 'relationship-1', type: 'smoothstep'},
  { id: 'e2-relationship', source: '2', target: 'relationship-1', type: 'smoothstep'},
  { id: 'relationship-3', source: 'relationship-1', target: '3', type: 'smoothstep' },
  { id: 'relationship-4', source: 'relationship-1', target: '4', type: 'smoothstep' },
  { id: 'relationship-5', source: 'relationship-1', target: '5', type: 'smoothstep' },
  { id: 'relationship-6', source: 'relationship-1', target: '6', type: 'smoothstep' },
  { id: 'relationship-7', source: 'relationship-1', target: '7', type: 'smoothstep' },
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

// import React, { useCallback } from 'react';
// import {
//   ReactFlow,
//   addEdge,
//   ConnectionLineType,
//   Panel,
//   useNodesState,
//   useEdgesState,
// } from '@xyflow/react';

// import dagre from 'dagre';
// import './index.css';
// import '@xyflow/react/dist/style.css';

// // Import the images
// import man from './assets/imgs/man.jpg';
// import woman from './assets/imgs/woman.jpg';
// import son from './assets/imgs/son.jpg';

// import PersonNode from './PersonNode';
// import RelationNode from './RelationNode';

// // Set up Dagre layout settings
// const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
// const nodeWidth = 50;
// const nodeHeight = 50;

// // Remove manual positioning of nodes
// const initialNodes = [
//   {
//     id: '1',
//     data: { label: 'Node 1', img: man, isAlive: true, name: 'Alzobair' },
//     type: 'custom', // Person node
//   },
//   {
//     id: '2',
//     data: { label: 'Node 2', img: woman, isAlive: true, name: 'Afraa' },
//     type: 'custom', // Person node
//   },
//   {
//     id: 'relationship-1',
//     data: { label: 'Marriage', isContinuance: false },
//     type: 'relation', // Relationship node
//   },
//   {
//     id: '3',
//     data: { label: 'Node 3', img: son, isAlive: true, name: 'Fatimah' },
//     type: 'custom', // Person node
//   },
//   {
//     id: '4',
//     data: { label: 'Node 4', img: son, isAlive: true, name: 'Shaima\'a' },
//     type: 'custom', // Person node
//   },
//   {
//     id: '5',
//     data: { label: 'Node 5', img: son, isAlive: true, name: 'Mohammad' },
//     type: 'custom', // Person node
//   },
//   {
//     id: '6',
//     data: { label: 'Node 6', img: son, isAlive: true, name: 'Abdo Allah' },
//     type: 'custom', // Person node
//   },
//   {
//     id: '7',
//     data: { label: 'Node 7', img: son, isAlive: true, name: 'Alaa' },
//     type: 'custom', // Person node
//   },
// ];

// const initialEdges = [
//   { id: 'e1-relationship', source: '1', target: 'relationship-1', type: 'smoothstep' },
//   { id: 'e2-relationship', source: '2', target: 'relationship-1', type: 'smoothstep' },
//   { id: 'relationship-3', source: 'relationship-1', target: '3', type: 'smoothstep' },
//   { id: 'relationship-4', source: 'relationship-1', target: '4', type: 'smoothstep' },
//   { id: 'relationship-5', source: 'relationship-1', target: '5', type: 'smoothstep' },
//   { id: 'relationship-6', source: 'relationship-1', target: '6', type: 'smoothstep' },
//   { id: 'relationship-7', source: 'relationship-1', target: '7', type: 'smoothstep' },
// ];

// const getLayoutedElements = (nodes, edges, direction = 'TB') => {
//   const isHorizontal = direction === 'LR';
//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: `${nodeWidth}`, height: `${nodeHeight}` });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   const newNodes = nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     const newNode = {
//       ...node,
//       targetPosition: isHorizontal ? 'left' : 'top',
//       sourcePosition: isHorizontal ? 'right' : 'bottom',
//       position: {
//         x: nodeWithPosition.x - nodeWidth / 2,
//         y: nodeWithPosition.y - nodeHeight / 2,
//       },
//     };

//     return newNode;
//   });

//   return { nodes: newNodes, edges };
// };

// const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
//   initialNodes,
//   initialEdges,
// );

// export default function App() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

//   const onConnect = useCallback(
//     (params) =>
//       setEdges((eds) =>
//         addEdge(
//           { ...params, type: ConnectionLineType.SmoothStep, animated: true },
//           eds,
//         ),
//       ),
//     [],
//   );

//   const nodeTypes = {
//     custom: PersonNode,
//     relation: RelationNode,
//   };

//   const onLayout = useCallback(
//     (direction) => {
//       const { nodes: layoutedNodes, edges: layoutedEdges } =
//         getLayoutedElements(nodes, edges, direction);

//       setNodes([...layoutedNodes]);
//       setEdges([...layoutedEdges]);
//     },
//     [nodes, edges],
//   );

//   return (
//     <ReactFlow
//       nodes={nodes}
//       edges={edges}
//       onNodesChange={onNodesChange}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//       nodeTypes={nodeTypes} // Add nodeTypes to ReactFlow
//       connectionLineType={ConnectionLineType.SmoothStep}
//       fitView
//     >
//       <Panel position="top-right">
//         <button onClick={() => onLayout('TB')}>vertical layout</button>
//         <button onClick={() => onLayout('LR')}>horizontal layout</button>
//       </Panel>
//     </ReactFlow>
//   );
// };
