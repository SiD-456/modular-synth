// main.cpp
#include <iostream>
#include <vector>
#include "graph.h"
#include "nodes.h"

// declared in graph.cpp
void writeWav(const std::string &fileName, const std::vector<float> &samples, int sampleRate);

int main() {
    const int sampleRate = 44100;
    const float freqHz = 440.0f;
    const int numChunksToRender = 100; // 100 * CHUNKSIZE samples total

    AudioGraph graph;

    // Create nodes
    AudioNode* oscRaw = graph.addNode("OscillatorNode");
    AudioNode* gainRaw = graph.addNode("GainNode");
    AudioNode* outRaw = graph.addNode("OutputNode");

    OscillatorNode* osc = dynamic_cast<OscillatorNode*>(oscRaw);
    GainNode* gain = dynamic_cast<GainNode*>(gainRaw);

    if (!osc || !gain) {
        std::cerr << "Failed to create nodes\n";
        return 1;
    }

    osc->setSampleRate(sampleRate);
    osc->setFrequency(freqHz);
    gain->setGainControl(0.5f);

    // Wire: osc -> gain -> output
    graph.connectNodes(oscRaw, gainRaw);
    graph.connectNodes(gainRaw, outRaw);

    std::vector<float> allSamples;
    allSamples.reserve(numChunksToRender * 128); // CHUNKSIZE from nodes.h

    for (int i = 0; i < numChunksToRender; i++) {
        std::vector<float> chunk = graph.processBuffer();
        std::cout << "Chunk " << i << " size: " << chunk.size() << "\n";

        if (chunk.empty()) {
            std::cerr << "WARNING: empty chunk at iteration " << i << "\n";
            continue;
        }

        allSamples.insert(allSamples.end(), chunk.begin(), chunk.end());
    }

    std::cout << "Total samples rendered: " << allSamples.size() << "\n";

    writeWav("sine_test.wav", allSamples, sampleRate);
    std::cout << "Wrote sine_test.wav\n";

    return 0;
}