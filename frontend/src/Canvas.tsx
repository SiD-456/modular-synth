import { ReactFlow, Background } from '@xyflow/react';

function Canvas() {
    return (<>
    <div className = "canvas">
        <ReactFlow>
            <Background />
        </ReactFlow>
    </div>
    </>)
}

export default Canvas