import {Handle, Position} from "@xyflow/react"
import "./nodes.css"

type OscillatorNodeProps = {
    data: {
        cppNode: any
        frequency : number;
    };
}

function OscillatorNode ({data} : OscillatorNodeProps) {
    return(<>
    <div className = "audioNode">
        <Handle type = "source" position = {Position.Right}></Handle>
        <h4>Oscillator</h4>
        <p>Frequency : {data.frequency} Hz</p>
    </div>
    </>)
}

export default OscillatorNode;