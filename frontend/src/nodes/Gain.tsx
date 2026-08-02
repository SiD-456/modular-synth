import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import "./nodes.css";

type GainNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
};

function GainNode({ data }: GainNodeProps) {
    const [db, setDb] = useState(0);

    useEffect(() => {
        const loadGain = async () => {
            const gain = await data.engine.getGain(data.nodeId);

            const dbValue = gain <= 0 ? -60 : Math.max(-60, 20 * Math.log10(gain));
            setDb(dbValue);
        };

        loadGain();
    }, [data.engine, data.nodeId]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const dbValue = Number(e.target.value);
        setDb(dbValue);

        const gain = Math.pow(10, dbValue / 20);
        await data.engine.setGain(data.nodeId, gain);
    };

    const handleCommit = async () => {
        const gain = Math.pow(10, db / 20);
        //console.log(gain);
        await data.engine.setGain(data.nodeId, gain);
    };

    return (
        <div className="audioNode">
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            <h4>Gain</h4>

            <p>{db.toFixed(1)} dB</p>

            <input
                className="nodrag"
                type="range"
                min={-20}
                max={6}
                step={0.5}
                value={db}
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
            />
        </div>
    );
}

export default GainNode;