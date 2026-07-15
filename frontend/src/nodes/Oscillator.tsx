import {Handle, Position} from "@xyflow/react"

type OscillatorNodeProps = {
    data: {
        frequency : number;
    };
}

function OscillatorNode ({data} : OscillatorNodeProps) {
    return(<>
    <div>
        <Handle type = "source" position = {Position.Right}></Handle>
        <h4>Oscillator</h4>
        <p>Frequency : {data.frequency} Hz</p>
    </div>
    </>)
}

export default OscillatorNode;