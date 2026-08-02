import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import "./nodes.css";

type MixerNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
    id: string;
};

const INPUT_COUNT = 5;

function MixerNode({ data, id }: MixerNodeProps) {
    const { getEdges, getNode } = useReactFlow();
    const [amplitudes, setAmplitudes] = useState<number[]>(
        Array(INPUT_COUNT).fill(1)
    );

    const handleAmplitudeChange = useCallback(
        async (index: number, value: number) => {
            setAmplitudes((prev) => {
                const next = [...prev];
                next[index] = value;
                return next;
            });

            const handleId = `input-${index}`;

            // Find the edge feeding this specific handle, then resolve the
            // source node to get its engine-side nodeId.
            const edge = getEdges().find(
                (e) => e.target === id && e.targetHandle === handleId
            );
            if (!edge) return;

            const sourceNode = getNode(edge.source);
            if (!sourceNode) return;

            const inputNodeId = sourceNode.data.nodeId as number;

            await data.engine.updateAmplitude(data.nodeId, inputNodeId, value);
        },
        [getEdges, getNode, id, data.engine, data.nodeId]
    );

    return (
        <div className="audioNode">
            <Handle type="source" position={Position.Right} />
            <h4>Mixer</h4>
            <div style={{ marginTop: "10px" }}>
                {Array.from({ length: INPUT_COUNT }).map((_, index) => {
                    const handleId = `input-${index}`;
                    const inputLabelId = `${handleId}-${data.nodeId}`;

                    return (
                        <div
                            key={handleId}
                            style={{
                                position: "relative",
                                marginTop: index === 0 ? 0 : "14px",
                                paddingLeft: "4px",
                            }}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={handleId}
                                style={{ top: "50%" }}
                            />
                            <label htmlFor={inputLabelId}>
                                Input {index + 1}
                            </label>
                            <input
                                id={inputLabelId}
                                className="nodrag"
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={amplitudes[index]}
                                onChange={(e) =>
                                    handleAmplitudeChange(
                                        index,
                                        parseFloat(e.target.value)
                                    )
                                }
                                style={{
                                    width: "100%",
                                    marginTop: "6px",
                                    display: "block",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MixerNode;