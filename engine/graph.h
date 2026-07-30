#ifndef GRAPH_H
#define GRAPH_H

#include <string>
#include <vector>
#include <memory>
#include "nodes.h"
#include <iostream>

class AudioGraph {
    private:
        std::vector<std::unique_ptr<AudioNode>> audioNodes;
        int nextId = 0;
        std::vector<int> topologicalOrder;
        OutputNode* outputNode = nullptr;
        std::vector<OscillatorNode*> sourceNodes;
        std::vector<ADSRNode*> adsrNodes;
        float currFreq = 0.0f;

    public:
        std::unique_ptr<WaveTable> sineWaveTable;
        std::unique_ptr<WaveTable> sawWaveTable;
        std::unique_ptr<WaveTable> squareWaveTable;
        std::unique_ptr<WaveTable> triangleWaveTable;

        int sampleRate = 44100;

        void keyDown(float freq);
        void keyUp(float freq);
        AudioGraph();
        int getSampleRate();
        AudioNode* addNode(std::string nodeType);
        AudioNode* getNodeById(int id);
        bool removeNode(int id);
        void connectNodes(AudioNode* node1, AudioNode* node2);
        void disconnectNodes(AudioNode* node1, AudioNode* node2);
        void topologicalSort();
        std::vector<float> processBuffer();
        void changeWaveTable(int nodeId, std::string waveTable);
};

void writeWav(const std::string &fileName, const std::vector<float> &samples, int sampleRate);

#endif // GRAPH_H
