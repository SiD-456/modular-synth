import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import "./nodes.css";

type WaveTable = "Sine" | "Square" | "Saw" | "Triangle";

const DEFAULT_WAVE_TABLE: WaveTable = "Sine";

type OscillatorNodeProps = {
    data: {
        engine: any;
        nodeId: number;
        waveTable?: WaveTable;
    };
};

function OscillatorNode({ data }: OscillatorNodeProps) {
    const [waveTable, setWaveTable] = useState<WaveTable>(
        data.waveTable ?? DEFAULT_WAVE_TABLE
    );

    // Ensure data always has a value (covers the case where the node was
    // just created and data.waveTable was never set).
    if (data.waveTable === undefined) {
        data.waveTable = DEFAULT_WAVE_TABLE;
    }

    const handleWaveTableChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value as WaveTable;
        setWaveTable(value);
        data.waveTable = value;
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