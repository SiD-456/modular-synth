import './Canvas.css';

import {
    ReactFlow,
    Background,
} from "@xyflow/react";

import type {
    Node,
    Edge,
    NodeTypes,
    OnNodesChange,
    OnEdgesChange,
} from "@xyflow/react";

import type {
    Dispatch,
    SetStateAction
} from 'react'

type CanvasProps = {
    nodes: Node[];
    edges: Edge[];
    nodeTypes: NodeTypes;
    setNodes: Dispatch<SetStateAction<Node[]>>;
    setEdges: Dispatch<SetStateAction<Edge[]>>;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;

};

function Canvas({ nodes, edges, setNodes, setEdges, nodeTypes, onNodesChange, onEdgesChange }: CanvasProps) {
    return (
        <div className="canvas">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                colorMode="dark"
            >
                <Background />
            </ReactFlow>
        </div>
    );
}

export default Canvas;