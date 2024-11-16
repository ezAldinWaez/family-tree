import React, { useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNode from './components/PersonNode';
import RelationNode from './components/RelationNode';

import familyData from './assets/DATA.json';

// Function for dynamic positioning
const getPosition = (index, generation, offset = 0) => ({
  x: 250 * index + generation * 100 + offset,
  y: 150 * generation,
});

// Automatically generate nodes and edges for ReactFlow
const generateGraph = (familyData) => {
  const nodes = [];
  const edges = [];

  // Helper function to add a person node to the graph
  const addPersonNode = (person, index, generation, offset = 0) => {
    nodes.push({
      id: person.id,
      data: { ...person },
      position: getPosition(index, generation, offset),
      type: 'custom',
    });
  };

  // Recursive function to build family tree
  const addFamily = (relId, generation) => {
    const relation = familyData.find((r) => r.id === relId);

    // Find father and mother for the relationship
    const father = familyData.find((person) => person.id === relation.F);
    const mother = familyData.find((person) => person.id === relation.M);

    // Add father and mother nodes with offset to avoid overlapping
    addPersonNode(father, 0, generation, 0);
    addPersonNode(mother, 1, generation, 0);

    // Add relationship node (marriage)
    const relationshipNodeId = `relationship-${relId}`;
    nodes.push({
      id: relationshipNodeId,     
      data: { label: 'Marriage' },
      position: getPosition(0.5, generation),
      type: 'relation',
    });

    // Create edges between parents and the relationship node
    edges.push({
      id: `e-${father.id}-${relationshipNodeId}`,
      source: father.id,
      target: relationshipNodeId,
      targetHandle: 'left',
      type: 'smoothstep',
    });
    edges.push({
      id: `e-${mother.id}-${relationshipNodeId}`,
      source: mother.id,
      target: relationshipNodeId,
      targetHandle: 'right',
      type: 'smoothstep',
    });

    // Add children under the relationship node
    relation.children.forEach((childId, index) => {
      const child = familyData.find((person) => person.id === childId);
      const childOffset = child.rel !== 'none' ? 60 : 0; // Offset if the child has a spouse
      addPersonNode(child, index, generation + 2, childOffset);

      // Connect relationship node to each child
      edges.push({
        id: `e-${relationshipNodeId}-${childId}`,
        source: relationshipNodeId,
        target: childId,
        type: 'smoothstep',
      });

      // Recurse if the child has their own relationship
      if (child.rel !== 'none') {
        addFamily(child.rel, generation + 2);
      }
    });
  };

  // Start building the tree from the top-most relationship (e.g., grandparents)
  addFamily('R-5', 0);

  return { nodes, edges };
};

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => generateGraph(familyData), []);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const nodeTypes = {
    custom: PersonNode,
    relation: RelationNode,
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#242424' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        style={{ background: '#242424' }}
      />
    </div>
  );
}
