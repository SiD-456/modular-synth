import { Handle, Position } from "@xyflow/react"
import "./nodes.css"

type OutputNodeProps = {
    data: {
        cppNode: any;
        level: number;
    };
}


function OutputNode({data}: OutputNodeProps) {
    return(<>
    <div className = "audioNode">
        <Handle type = "target" position = {Position.Left}></Handle>
        <h4>Output</h4>
        <p>On</p>
    </div>
    </>)
}

export default OutputNode;