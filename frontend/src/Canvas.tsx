import './Canvas.css';

import {
    ReactFlow,
    Background,
    addEdge
} from "@xyflow/react";

import type {
    Connection,
    Node,
    Edge,
    NodeTypes,
    OnNodesChange,
    OnEdgesChange,
} from "@xyflow/react";

import {
    useCallback,
    type Dispatch,
    type SetStateAction
} from 'react'

type CanvasProps = {
    engine: any
    nodes: Node[];
    edges: Edge[];
    nodeTypes: NodeTypes;
    setNodes: Dispatch<SetStateAction<Node[]>>;
    setEdges: Dispatch<SetStateAction<Edge[]>>;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;

};

function Canvas({ nodes, edges, setNodes, setEdges, nodeTypes, onNodesChange, onEdgesChange, engine}: CanvasProps) {

        const onConnect = async (connection: Connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);

            if (!sourceNode || !targetNode)
                return;

            await engine.connect(
                sourceNode.data.nodeId,
                targetNode.data.nodeId
            );

            setEdges((eds) => addEdge(connection, eds));
        };

        const deleteNode = async (node: Node) => {
            engine.deleteNode(node.data.nodeId);
        }

        const deleteEdge = async (edge: Edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n =>n.id === edge.target);

            if (!sourceNode || !targetNode)
                return;

            await engine.disconnect(
                sourceNode.data.nodeId,
                targetNode.data.nodeId
            );
        }

    return (
        <div className="canvas">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgesDelete={(deletedEdges) => {
                    deletedEdges.forEach(deleteEdge);
                }}
                onConnect = {onConnect}
                onNodesDelete = {(deletedNodes) => {
                    deletedNodes.forEach(deleteNode);
                    console.log(deletedNodes);
                }}
                colorMode="dark"
            >
                <Background />
            </ReactFlow>
        </div>
    );
}

export default Canvas;