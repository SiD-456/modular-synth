import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import "./nodes.css";

type OscillatorNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
};

function OscillatorNode({ data }: OscillatorNodeProps) {
    const [frequency, setFrequency] = useState(440);

    useEffect(() => {
        //console.log(data.nodeId);
        const loadFrequency = async () => {
            const freq = await data.engine.getFrequency(data.nodeId);
            setFrequency(freq);
        };

        loadFrequency();
    }, [data.engine, data.nodeId]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFrequency(value);
    await data.engine.setFrequency(data.nodeId, value);
};

    const handleCommit = async () => {
        console.log(frequency);
        await data.engine.setFrequency(data.nodeId, frequency);
    };

    return (
        <div className="audioNode">
            <Handle type="source" position={Position.Right} />

            <h4>Oscillator</h4>

            <p>Frequency: {frequency} Hz</p>

            <input
                className="nodrag"
                type="range"
                min={20}
                max={2000}
                step={1}
                value={frequency}
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                onPointerUp={() => console.log("pointer up")}
            />
        </div>
    );
}

export default OscillatorNode;