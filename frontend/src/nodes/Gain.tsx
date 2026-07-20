import {Handle, Position} from "@xyflow/react"
import "./nodes.css"

type GainNodeProps = {
    data: {
        cppNode: any;
        level: number;
    };
}

function GainNode ({data} : GainNodeProps) {
    return(<>
    <div className = "audioNode">
        <Handle type = "target" position = {Position.Left}></Handle>
        <Handle type = "source" position = {Position.Right}></Handle>
        <h4>Gain</h4>
        <p>Frequency : {data.level} dB</p>
    </div>
    </>)
}

export default GainNode;