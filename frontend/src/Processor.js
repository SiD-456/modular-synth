import "./urlPolyfill.tsx";
import createAudioModule from "./modules/audio_module.js"

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.ready = false;
        this.queue = [];
        this.isPlaying = false;

        const Module = {
            locateFile: (patH) => {
                return './modules/audio_module.wasm';
            }
        };
        createAudioModule(Module).then((module) => {
            this.module = module;
            this.graph = new module.AudioGraph();
            this.ready = true;
            this.queue.forEach((msg) => this.handleMessage(msg));
            this.queue = [];
        });

        this.port.onmessage = (event) => {
            if (!this.ready) {
                this.queue.push(event.data);
                return;
            }
            this.handleMessage(event.data);
        };
    }

    handleMessage(msg) {
        switch (msg.type) {
            case "addNode": {
                const node = this.graph.addNode(msg.nodeType);
                const nodeId = node.getId();
                this.port.postMessage({ requestId: msg.requestId, result: nodeId });
                break;
            }
            case "connect": {
                const sourceNode = this.graph.getNodeById(msg.srcId);
                const destNode = this.graph.getNodeById(msg.dstId);
                this.graph.connectNodes(sourceNode, destNode);
                this.port.postMessage({ requestId: msg.requestId, result: null });
                break;
            }
            case "play": {
                //console.log("started playing");
                this.isPlaying = true;
                break;
            }
            case "pause": {
                this.isPlaying = false;
            }
        }
    }

    process(inputs, outputs) {
        if (!this.ready || !this.isPlaying) {
            return true; 
        }
        //console.log("playing audio");
        const output = outputs[0];
        const samples = this.graph.processBuffer(); 

        for (let ch = 0; ch < output.length; ch++) {
            const channel = output[ch];
            for (let i = 0; i < channel.length; i++) {
                channel[i] = samples[i];
            }
        }

        return true;
    }
}

registerProcessor("audio-processor", AudioProcessor);