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
                //console.log(sourceNode, destNode);
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
                break;
            }
            case "getFrequency": {
                const node = this.graph.getNodeById(msg.nodeId);
                //console.log(node);
                const frequency = node.getFrequency();
                this.port.postMessage({ requestId: msg.requestId, result: frequency });
                break;
            }
            case "setFrequency": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setFrequency(msg.frequency);
                console.log(msg.frequency);
                this.port.postMessage({ requestId: msg.requestId, result: msg.frequency });
                break;
            }
            case "getGain": {
                const node = this.graph.getNodeById(msg.nodeId);
                const gain = node.getGainControl();
                this.port.postMessage({ requestId: msg.requestId, result: gain });
                break;
            }
            case "setGain": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setGainControl(msg.gain);
                console.log(msg.gain);
                this.port.postMessage({ requestId: msg.requestId, result: msg.gain });
                break;
            }
            case "updateAmplitude": {
                const mixer = this.graph.getNodeById(msg.mixerNodeId);
                const input = this.graph.getNodeById(msg.inputNodeId);

                mixer.updateAmplitude(input, msg.amplitude);

                this.port.postMessage({
                    requestId: msg.requestId,
                    result: msg.amplitude,
                });
                break;
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