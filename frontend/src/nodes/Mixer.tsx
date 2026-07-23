import {
    Handle,
    Position,
    useNodeConnections,
    useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import "./nodes.css";

type MixerNodeProps = {
    id: string;
    data: {
        engine: any;
        nodeId: number;
    };
};

const sliderToGain = (v: number) => {
    // 0 -> 0
    if (v === 0) return 0;

    // -60dB to +6dB
    const db = -60 + (v / 100) * 66;
    return Math.pow(10, db / 20);
};

const gainToString = (gain: number) => gain.toFixed(2);

function MixerNode({ id, data }: MixerNodeProps) {
    const { getNode } = useReactFlow();

    const connections = useNodeConnections({
        id,
        handleType: "target",
    });

    // slider positions (0-100)
    const [sliderValues, setSliderValues] = useState([91, 91, 91, 91, 91]);

    const handleChange =
        (index: number) =>
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const slider = Number(e.target.value);

            const next = [...sliderValues];
            next[index] = slider;
            setSliderValues(next);

            const gain = sliderToGain(slider);

            const connection = connections.find(
                (c) => c.targetHandle === `in-${index}`
            );

            if (!connection) return;

            const sourceNode = getNode(connection.source);

            if (!sourceNode) return;

            await data.engine.updateAmplitude(
                data.nodeId,
                sourceNode.data.nodeId,
                gain
            );
        };

    return (
        <div className="audioNode mixerNode">
            <Handle
                id="out"
                type="source"
                position={Position.Right}
                style={{ top: "50%" }}
            />

            <h4>Mixer</h4>

            {sliderValues.map((slider, i) => {
                const gain = sliderToGain(slider);

                return (
                    <div key={i} className="mixerRow">
                        <Handle
                            id={`in-${i}`}
                            type="target"
                            position={Position.Left}
                            style={{ top: "50%" }}
                        />

                        <label>Input {i + 1}</label>

                        <input
                            className="nodrag"
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={slider}
                            onChange={handleChange(i)}
                        />

                        <span className="gainValue">
                            {gainToString(gain)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default MixerNode;