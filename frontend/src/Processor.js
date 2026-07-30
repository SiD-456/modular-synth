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
            case "deleteNode": {
                this.graph.removeNode(src.nodeId);
                this.port.postMessage({requestId: msg.requestId, result: null});
                break;
            }
            case "connect": {
                const sourceNode = this.graph.getNodeById(msg.srcId);
                const destNode = this.graph.getNodeById(msg.dstId);
                this.graph.connectNodes(sourceNode, destNode);
                this.port.postMessage({ requestId: msg.requestId, result: null });
                break;
            }

            case "disconnect" : {
                const sourceNode = this.graph.getNodeById(msg.srcId);
                const destNode = this.graph.getNodeById(msg.dstId);
                this.graph.disconnectNodes(sourceNode, destNode);
                this.port.postMessage({requestId: msg.requestId, result: null});
                break;
            }

            case "play": {
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
            case "keyDown": {
                this.graph.keyDown(msg.frequency);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: null,
                });
                break;
            }

            case "keyUp": {
                this.graph.keyUp(msg.frequency);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: null,
                });
                break;
            }

            case "getAttack": {
                const node = this.graph.getNodeById(msg.nodeId);
                const value = node.getAttack();
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: value,
                });
                break;
            }

            case "setAttack": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setAttack(msg.attack);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: msg.attack,
                });
                break;
            }

            case "getDecay": {
                const node = this.graph.getNodeById(msg.nodeId);
                const value = node.getDecay();
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: value,
                });
                break;
            }

            case "setDecay": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setDecay(msg.decay);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: msg.decay,
                });
                break;
            }

            case "getSustain": {
                const node = this.graph.getNodeById(msg.nodeId);
                const value = node.getSustain();
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: value,
                });
                break;
            }

            case "setSustain": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setSustain(msg.sustain);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: msg.sustain,
                });
                break;
            }

            case "getRelease": {
                const node = this.graph.getNodeById(msg.nodeId);
                const value = node.getRelease();
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: value,
                });
                break;
            }

            case "setRelease": {
                const node = this.graph.getNodeById(msg.nodeId);
                node.setRelease(msg.release);
                this.port.postMessage({
                    requestId: msg.requestId,
                    result: msg.release,
                });
                break;
            }

            case "changeWaveTable": {
                this.graph.changeWaveTable(msg.nodeId, msg.waveTable);
                this.port.postMessage({
                    requestId: msg.requestId,
                    reuslt: null
                })
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