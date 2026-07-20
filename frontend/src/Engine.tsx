import "./urlPolyfill.tsx";

class Engine {
    context: AudioContext;
    worklet!: AudioWorkletNode;
    private nextRequestId = 0;
    private pending = new Map<number, (value: any) => void>();

    private constructor() {
        this.context = new AudioContext();
    }

    static async create() {
        const engine = new Engine();
        const processorUrl = new URL("./Processor.js", import.meta.url);
        await engine.context.audioWorklet.addModule(processorUrl);

        engine.worklet = new AudioWorkletNode(engine.context, "audio-processor");
        engine.worklet.connect(engine.context.destination);

        engine.worklet.port.onmessage = (event) => {
            const { requestId, result } = event.data;
            const resolve = engine.pending.get(requestId);
            if (resolve) {
                resolve(result);
                engine.pending.delete(requestId);
            }
        };

        return engine;
    }

    private call(message: object): Promise<any> {
        const requestId = this.nextRequestId++;
        return new Promise((resolve) => {
            this.pending.set(requestId, resolve);
            this.worklet.port.postMessage({ ...message, requestId });
        });
    }

    async addNode(nodeType: string): Promise<number> {
        return this.call({ type: "addNode", nodeType });
    }

    async connect(srcId: number, dstId: number): Promise<void> {
        return this.call({ type: "connect", srcId, dstId });
    }

    async play(){
        if (this.context.state === "suspended") {
        await this.context.resume();
        }
        this.worklet.port.postMessage({type: "play"});
    }

    pause(){

        this.worklet.port.postMessage({type: "pause"});
    }
}

export default Engine;