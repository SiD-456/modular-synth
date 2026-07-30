import { useEffect, useRef, useState } from "react";
import "./nodes.css";

type KeyboardNodeProps = {
    data: {
        engine: any;
    };
};

type PianoKey = {
    key: string;
    label: string;
    offset: number;
    type: "white" | "black";
};

const KEYS: PianoKey[] = [
    { key: "z", label: "C4", offset: 0, type: "white" },
    { key: "s", label: "C#4", offset: 1, type: "black" },
    { key: "x", label: "D4", offset: 2, type: "white" },
    { key: "d", label: "D#4", offset: 3, type: "black" },
    { key: "c", label: "E4", offset: 4, type: "white" },
    { key: "v", label: "F4", offset: 5, type: "white" },
    { key: "g", label: "F#4", offset: 6, type: "black" },
    { key: "b", label: "G4", offset: 7, type: "white" },
    { key: "h", label: "G#4", offset: 8, type: "black" },
    { key: "n", label: "A4", offset: 9, type: "white" },
    { key: "j", label: "A#4", offset: 10, type: "black" },
    { key: "m", label: "B4", offset: 11, type: "white" },
    { key: "q", label: "C5", offset: 12, type: "white" },
    { key: "2", label: "C#5", offset: 13, type: "black" },
    { key: "w", label: "D5", offset: 14, type: "white" },
    { key: "3", label: "D#5", offset: 15, type: "black" },
    { key: "e", label: "E5", offset: 16, type: "white" },
    { key: "r", label: "F5", offset: 17, type: "white" },
    { key: "5", label: "F#5", offset: 18, type: "black" },
    { key: "t", label: "G5", offset: 19, type: "white" },
    { key: "6", label: "G#5", offset: 20, type: "black" },
    { key: "y", label: "A5", offset: 21, type: "white" },
    { key: "7", label: "A#5", offset: 22, type: "black" },
    { key: "u", label: "B5", offset: 23, type: "white" },
    { key: "i", label: "C6", offset: 24, type: "white" },
];

const KEY_MAP: Record<string, number> = Object.fromEntries(
    KEYS.map((k) => [k.key, k.offset])
);

const BASE_FREQ = 261.63;

function semitoneToFreq(offset: number) {
    return BASE_FREQ * Math.pow(2, offset / 12);
}

function KeyboardNode({ data }: KeyboardNodeProps) {
    const [activeOffsets, setActiveOffsets] = useState<Set<number>>(new Set());
    const pressedRef = useRef<Set<string>>(new Set());

    const updateActiveKeys = () => {
        setActiveOffsets(
            new Set(
                [...pressedRef.current]
                    .map((k) => KEY_MAP[k])
                    .filter((v) => v !== undefined)
            )
        );
    };

    const pressKey = async (mapKey: string) => {
        if (!(mapKey in KEY_MAP)) return;
        if (pressedRef.current.has(mapKey)) return;

        pressedRef.current.add(mapKey);
        updateActiveKeys();

        await data.engine.keyDown(semitoneToFreq(KEY_MAP[mapKey]));
    };

    const releaseKey = async (mapKey: string) => {
        if (!(mapKey in KEY_MAP)) return;
        if (!pressedRef.current.has(mapKey)) return;

        pressedRef.current.delete(mapKey);
        updateActiveKeys();

        await data.engine.keyUp(semitoneToFreq(KEY_MAP[mapKey]));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            const key = e.key.toLowerCase();
            if (!(key in KEY_MAP)) return;

            e.preventDefault();
            pressKey(key);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (!(key in KEY_MAP)) return;

            e.preventDefault();
            releaseKey(key);
        };

        const handleBlur = () => {
            pressedRef.current.forEach((key) => {
                data.engine.keyUp(semitoneToFreq(KEY_MAP[key]));
            });

            pressedRef.current.clear();
            updateActiveKeys();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);

            handleBlur();
        };
    }, [data.engine]);

    const whiteKeys = KEYS.filter((k) => k.type === "white");
    const blackKeys = KEYS.filter((k) => k.type === "black");

    const whiteKeyWidth = 100 / whiteKeys.length;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    const whiteIndexBefore: Record<number, number> = {
        1: 0,
        3: 1,
        6: 3,
        8: 4,
        10: 5,
        13: 7,
        15: 8,
        18: 10,
        20: 11,
        22: 12,
    };

    const blackKeyLeft = (offset: number) => {
        const index = whiteIndexBefore[offset];
        return (index + 1) * whiteKeyWidth - blackKeyWidth / 2;
    };

    return (
        <div className="audioNode keyboardNode">
            <h4>Keyboard</h4>

            <div className="piano nodrag">
                <div className="piano-white-keys">
                    {whiteKeys.map((k) => (
                        <div
                            key={k.key}
                            className={`piano-key piano-key-white ${
                                activeOffsets.has(k.offset) ? "active" : ""
                            }`}
                            style={{ width: `${whiteKeyWidth}%` }}
                            onMouseDown={() => pressKey(k.key)}
                            onMouseUp={() => releaseKey(k.key)}
                            onMouseLeave={() => releaseKey(k.key)}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                pressKey(k.key);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                releaseKey(k.key);
                            }}
                        >
                            <span className="piano-key-label">{k.key}</span>
                        </div>
                    ))}
                </div>

                <div className="piano-black-keys">
                    {blackKeys.map((k) => (
                        <div
                            key={k.key}
                            className={`piano-key piano-key-black ${
                                activeOffsets.has(k.offset) ? "active" : ""
                            }`}
                            style={{
                                left: `${blackKeyLeft(k.offset)}%`,
                                width: `${blackKeyWidth}%`,
                            }}
                            onMouseDown={() => pressKey(k.key)}
                            onMouseUp={() => releaseKey(k.key)}
                            onMouseLeave={() => releaseKey(k.key)}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                pressKey(k.key);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                releaseKey(k.key);
                            }}
                        >
                            <span className="piano-key-label">{k.key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KeyboardNode;