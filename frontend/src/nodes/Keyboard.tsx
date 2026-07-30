import { Handle, Position } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import "./nodes.css";

type KeyboardNodeProps = {
    data: {
        engine: any;
        nodeId: number;
    };
};

// 2 octaves starting at C4, semitone offsets from C4
const KEY_MAP: Record<string, number> = {
    // Octave 1 (bottom row)
    z: 0,   // C
    s: 1,   // C#
    x: 2,   // D
    d: 3,   // D#
    c: 4,   // E
    v: 5,   // F
    g: 6,   // F#
    b: 7,   // G
    h: 8,   // G#
    n: 9,   // A
    j: 10,  // A#
    m: 11,  // B
    ",": 12, // C (octave 2)

    // Octave 2 (top row)
    q: 12,  // C
    "2": 13, // C#
    w: 14,  // D
    "3": 15, // D#
    e: 16,  // E
    r: 17,  // F
    "5": 18, // F#
    t: 19,  // G
    "6": 20, // G#
    y: 21,  // A
    "7": 22, // A#
    u: 23,  // B
    i: 24,  // C (octave 3)
};

const BASE_FREQ = 261.63; // C4

function semitoneToFreq(offset: number) {
    return BASE_FREQ * Math.pow(2, offset / 12);
}

function KeyboardNode({ data }: KeyboardNodeProps) {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    // tracks which keys are currently "down" so we don't refire on OS key-repeat
    const pressedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (!(key in KEY_MAP)) return;
            if (pressedRef.current.has(key)) return; // ignore repeats

            pressedRef.current.add(key);
            setActiveKeys(new Set(pressedRef.current));

            const freq = semitoneToFreq(KEY_MAP[key]);
            await data.engine.keyDown(freq);
        };

        const handleKeyUp = async (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (!(key in KEY_MAP)) return;
            if (!pressedRef.current.has(key)) return;

            pressedRef.current.delete(key);
            setActiveKeys(new Set(pressedRef.current));

            const freq = semitoneToFreq(KEY_MAP[key]);
            await data.engine.keyUp(freq);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);

            // release any still-held keys on unmount
            pressedRef.current.forEach((key) => {
                data.engine.keyUp(semitoneToFreq(KEY_MAP[key]));
            });
            pressedRef.current.clear();
        };
    }, [data.engine]);

    return (
        <div className="audioNode">
            <Handle type="source" position={Position.Right} />

            <h4>Keyboard</h4>

            <p>
                {activeKeys.size > 0
                    ? `Playing: ${Array.from(activeKeys).join(", ")}`
                    : "Press Z–M, ,/ or Q–I to play"}
            </p>
        </div>
    );
}

export default KeyboardNode;