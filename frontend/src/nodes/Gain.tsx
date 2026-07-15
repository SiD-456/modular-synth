import {Handle, Position} from "@xyflow/react"

type GainNodeProps = {
    data: {
        level: number;
    };
}

function GainNode ({data} : GainNodeProps) {
    return(<>
    <div>
        <Handle type = "target" position = {Position.Left}></Handle>
        <Handle type = "source" position = {Position.Right}></Handle>
        <h4>Gain</h4>
        <p>Frequency : {data.level} dB</p>
    </div>
    </>)
}

export default GainNode;