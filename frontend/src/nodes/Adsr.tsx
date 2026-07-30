import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import "./nodes.css";

type ADSRNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
};

function ADSRNode({ data }: ADSRNodeProps) {
    const [attack, setAttack] = useState(0.1);
    const [decay, setDecay] = useState(0.3);
    const [sustain, setSustain] = useState(0.5);
    const [release, setRelease] = useState(0.3);

    useEffect(() => {
        const loadValues = async () => {
            setAttack(await data.engine.getAttack(data.nodeId));
            setDecay(await data.engine.getDecay(data.nodeId));
            setSustain(await data.engine.getSustain(data.nodeId));
            setRelease(await data.engine.getRelease(data.nodeId));
        };

        loadValues();
    }, [data.engine, data.nodeId]);

    const handleAttackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setAttack(value);
        await data.engine.setAttack(data.nodeId, value);
    };

    const handleDecayChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setDecay(value);
        await data.engine.setDecay(data.nodeId, value);
    };

    const handleSustainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setSustain(value);
        await data.engine.setSustain(data.nodeId, value);
    };

    const handleReleaseChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setRelease(value);
        await data.engine.setRelease(data.nodeId, value);
    };

    // Envelope visualization
    const WIDTH = 220;
    const HEIGHT = 100;
    const PADDING = 10;

    const totalTime = attack + decay + release + 0.3;

    const graphWidth = WIDTH - 2 * PADDING;

    const x0 = PADDING;
    const x1 = x0 + (attack / totalTime) * graphWidth;
    const x2 = x1 + (decay / totalTime) * graphWidth;
    const sustainWidth = graphWidth * 0.25;
    const x3 = Math.min(x2 + sustainWidth, WIDTH - PADDING);
    const x4 = WIDTH - PADDING;

    const yBottom = HEIGHT - PADDING;
    const yTop = PADDING;
    const ySustain = yBottom - sustain * (yBottom - yTop);

    return (
        <div className="audioNode">
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            <h4>ADSR</h4>

            <svg
                width={WIDTH}
                height={HEIGHT}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{
                    width: "100%",
                    border: "1px solid #555",
                    borderRadius: "6px",
                    background: "#1c1c1c",
                    marginBottom: "10px",
                }}
            >
                {/* Horizontal grid */}
                {[0.25, 0.5, 0.75].map((v) => (
                    <line
                        key={v}
                        x1={0}
                        y1={HEIGHT * v}
                        x2={WIDTH}
                        y2={HEIGHT * v}
                        stroke="#333"
                        strokeWidth={1}
                    />
                ))}

                {/* Envelope */}
                <polyline
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth={3}
                    points={`
                        ${x0},${yBottom}
                        ${x1},${yTop}
                        ${x2},${ySustain}
                        ${x3},${ySustain}
                        ${x4},${yBottom}
                    `}
                />

                {/* Control points */}
                {[
                    [x0, yBottom],
                    [x1, yTop],
                    [x2, ySustain],
                    [x3, ySustain],
                    [x4, yBottom],
                ].map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={3}
                        fill="#4CAF50"
                    />
                ))}
            </svg>

            <p>Attack: {attack.toFixed(2)} s</p>
            <input
                className="nodrag"
                type="range"
                min={0.01}
                max={5}
                step={0.01}
                value={attack}
                onChange={handleAttackChange}
            />

            <p>Decay: {decay.toFixed(2)} s</p>
            <input
                className="nodrag"
                type="range"
                min={0.01}
                max={5}
                step={0.01}
                value={decay}
                onChange={handleDecayChange}
            />

            <p>Sustain: {sustain.toFixed(2)}</p>
            <input
                className="nodrag"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sustain}
                onChange={handleSustainChange}
            />

            <p>Release: {release.toFixed(2)} s</p>
            <input
                className="nodrag"
                type="range"
                min={0.01}
                max={5}
                step={0.01}
                value={release}
                onChange={handleReleaseChange}
            />
        </div>
    );
}

export default ADSRNode;