#include "graph.h"
#include <fstream>
#include <queue>
#include <map>

AudioGraph::AudioGraph() {
    swt = std::make_unique<SineWaveTable>(1024);
}

AudioNode* AudioGraph::addNode(std::string nodeType) {
    std::unique_ptr<AudioNode> node;
    if (nodeType == "OscillatorNode") {
        node = std::make_unique<OscillatorNode>(swt.get());
    } else if (nodeType == "GainNode") {
        node = std::make_unique<GainNode>();
    } else if (nodeType == "MixerNode") {
        node = std::make_unique<MixerNode>();
    } else if (nodeType == "OutputNode") {
        node = std::make_unique<OutputNode>();
        outputNode = dynamic_cast<OutputNode*>(node.get());
    } else {
        throw std::runtime_error("Unknown Node Type");
    }

    node->setId(++this->nextId);
    AudioNode* sharedPointer = node.get();
    audioNodes.push_back(std::move(node));
    return sharedPointer;
}

AudioNode* AudioGraph::getNodeById(int id) {
    for (int i = 0; i < audioNodes.size(); i++) {
        if (audioNodes[i]->getId() == id) {
            AudioNode* node = audioNodes[i].get();
            return node;
        }
    }
    return nullptr;
}

bool AudioGraph::removeNode(int id) {
    for (int i = 0; i < audioNodes.size(); i++) {
        if (audioNodes[i]->getId() == id) {
            for (auto* input : audioNodes[i]->inputNodes) {
                input->removeOutput(audioNodes[i].get());
            }

            for (auto* output : audioNodes[i]->outputNodes) {
                output->removeInput(audioNodes[i].get());
            }
            audioNodes.erase(audioNodes.begin() + i);
            topologicalSort();
            return true;
        }
    }
    return false;
}

void AudioGraph::connectNodes(AudioNode* node1, AudioNode* node2) {
    node1->addOutput(node2);
    node2->addInput(node1);
    topologicalSort();
}

void AudioGraph::disconnectNodes(AudioNode* node1, AudioNode* node2) {
    node1->removeOutput(node2);
    node2->removeInput(node1);
    topologicalSort();
}

void AudioGraph::topologicalSort() {
    topologicalOrder.clear();
    std::queue<int> q;
    std::map<int, int> indegrees;
    for (int i = 0; i < audioNodes.size(); i++) {
        indegrees[audioNodes[i]->getId()] = audioNodes[i]->inputNodes.size();
    }

    for (auto& [id, indegree] : indegrees) {
        if (indegree == 0) {
            q.push(id);
        }
    }

    while (q.size() > 0) {
        AudioNode* currentNode = getNodeById(q.front());
        for (AudioNode* node : currentNode->outputNodes) {
            indegrees[node->getId()]--;
            if (indegrees[node->getId()] == 0) {
                q.push(node->id);
            }
        }
        topologicalOrder.push_back(q.front());
        q.pop();
    }
}

std::vector<float> AudioGraph::processBuffer() {
    for (int nodeId : topologicalOrder) {
        AudioNode* node = getNodeById(nodeId);
        node->process();
    }

    return this->outputNode->getBuffer();
}

void writeWav(const std::string &fileName, const std::vector<float> &samples, int sampleRate) {
    std::ofstream file(fileName, std::ios::binary);

    int numSamples = samples.size();
    int dataSize = numSamples * sizeof(int16_t);

    file.write("RIFF", 4);
    int chunkSize = 36 + dataSize;
    file.write(reinterpret_cast<char*>(&chunkSize), 4);

    file.write("WAVE", 4);
    file.write("fmt ", 4);
    int subchunk1Size = 16;
    short audioFormat = 1; // PCM
    short numChannels = 1;
    int byteRate = sampleRate * numChannels * sizeof(int16_t);
    short blockAlign = numChannels * sizeof(int16_t);
    short bitsPerSample = 16;

    file.write(reinterpret_cast<char*>(&subchunk1Size), 4);
    file.write(reinterpret_cast<char*>(&audioFormat), 2);
    file.write(reinterpret_cast<char*>(&numChannels), 2);
    file.write(reinterpret_cast<char*>(&sampleRate), 4);
    file.write(reinterpret_cast<char*>(&byteRate), 4);
    file.write(reinterpret_cast<char*>(&blockAlign), 2);
    file.write(reinterpret_cast<char*>(&bitsPerSample), 2);

    file.write("data", 4);
    file.write(reinterpret_cast<char*>(&dataSize), 4);

    for (float sample : samples) {
        int16_t pcm = (int16_t)(sample * 32767.0f);
        file.write(reinterpret_cast<char*>(&pcm), sizeof(int16_t));
    }

    file.close();
}
