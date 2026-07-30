import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import "./nodes.css";

type WaveTable = "Sine" | "Square" | "Saw" | "Triangle";

type OscillatorNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
};

function OscillatorNode({ data }: OscillatorNodeProps) {
    const [waveTable, setWaveTable] = useState<WaveTable>("Sine");

    const handleWaveTableChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value as WaveTable;
        setWaveTable(value);
        await data.engine.changeWaveTable(data.nodeId, value);
    };

    return (
        <div className="audioNode">
            <Handle type="source" position={Position.Right} />

            <h4>Oscillator</h4>

            <div style={{ marginTop: "10px" }}>
                <label htmlFor={`wavetable-${data.nodeId}`}>
                    Wave Table
                </label>

                <select
                    id={`wavetable-${data.nodeId}`}
                    className="nodrag"
                    value={waveTable}
                    onChange={handleWaveTableChange}
                    style={{
                        width: "100%",
                        marginTop: "6px",
                        padding: "6px",
                        borderRadius: "6px",
                    }}
                >
                    <option value="Sine">Sine</option>
                    <option value="Square">Square</option>
                    <option value="Saw">Saw</option>
                    <option value="Triangle">Triangle</option>
                </select>
            </div>
        </div>
    );
}

export default OscillatorNode;