import { Handle, Position } from "@xyflow/react"
type OutputNodeProps = {
    data: {
        level: number;
    };
}


function OutputNode({data}: OutputNodeProps) {
    return(<>
    <div>
        <Handle type = "target" position = {Position.Left}></Handle>
        <h4>Output</h4>
        <p>Frequency : {data.level} dB</p>
    </div>
    </>)
}

export default OutputNode;