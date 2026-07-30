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
                    border: "1px solid #a83bb5",
                    borderRadius: "6px",
                    background: "#1b0d20",
                    marginBottom: "10px",
                }}
            >
                {/* Grid */}
                {[0.25, 0.5, 0.75].map((v) => (
                    <line
                        key={v}
                        x1={PADDING}
                        y1={HEIGHT * v}
                        x2={WIDTH - PADDING}
                        y2={HEIGHT * v}
                        stroke="#4b2952"
                        strokeWidth={1}
                    />
                ))}

                {/* Baseline */}
                <line
                    x1={PADDING}
                    y1={yBottom}
                    x2={WIDTH - PADDING}
                    y2={yBottom}
                    stroke="#6b3c72"
                    strokeWidth={1}
                />

                {/* Envelope */}
                <polyline
                    fill="none"
                    stroke="#ecd9ef"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    strokeLinecap="round"
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
                        r={4}
                        fill="#a83bb5"
                        stroke="#ecd9ef"
                        strokeWidth={2}
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