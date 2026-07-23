#include "nodes.h"
#include "graph.h"
#include <cmath>
#include <algorithm>

constexpr double PI = 3.14159265358979323846;


SineWaveTable::SineWaveTable(int size) {
    this->size = size;
    constructWaveTable();
}

void SineWaveTable::constructWaveTable() {
    waveTable.resize(size);
    for (int i = 0; i < size; i++) {
        waveTable[i] = (sin(2 * PI * i / size));
    }
}


void AudioNode::setId(int id) {
    this->id = id;
}

int AudioNode::getId() {
    return this->id;
}

bool AudioNode::addInput(AudioNode* node) {
    if (inputNodes.size() >= maxInputs()) {
        return false;
    } else {
        inputNodes.push_back(node);
        onInputAdded();
        return true;
    }
}

bool AudioNode::addOutput(AudioNode* node) {
    if (outputNodes.size() >= maxOutputs()) {
        return false;
    } else {
        outputNodes.push_back(node);
        return true;
    }
}

bool AudioNode::removeInput(AudioNode* node) {
    if (inputNodes.size() <= minInputs()) {
        return false;
    } else {
        auto it = std::find(inputNodes.begin(), inputNodes.end(), node);

        if (it != inputNodes.end()) {
            size_t index = it - inputNodes.begin();
            inputNodes.erase(it);
            onInputRemoved(index);
            return true;
        }

        return false;
    }
}

bool AudioNode::removeOutput(AudioNode* node) {
    if (outputNodes.size() <= minOutputs()) {
        return false;
    } else {
        auto it = std::find(outputNodes.begin(), outputNodes.end(), node);

        if (it != outputNodes.end()) {
            outputNodes.erase(it);
            return true;
        }

        return false;
    }
}


OscillatorNode::OscillatorNode(const AudioGraph* graph, const WaveTable* wt) : table(wt) {
    updatePhaseInc();
    setSampleRate(graph->sampleRate);
}

void OscillatorNode::changeWaveTable(WaveTable* wt) {
    table = wt;
    updatePhaseInc();
}

void OscillatorNode::updatePhaseInc() {
    phaseInc = table->size * frequency / sampleRate;
}

void OscillatorNode::setSampleRate(int sampleRate) {
    this->sampleRate = sampleRate;
    updatePhaseInc();
}

void OscillatorNode::setFrequency(float frequency) {
    this->frequency = frequency;
    updatePhaseInc();
}

float OscillatorNode::getFrequency(){
    return this->frequency;
}

void OscillatorNode::incrementPhase() {
    phase += phaseInc;
    while (phase >= table->size) {
        phase -= table->size;
    }
}

void OscillatorNode::process() {
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++) {
        int index0 = (int)phase;
        int index1 = (index0 + 1) % table->size;

        float sample0 = table->waveTable[index0];
        float sample1 = table->waveTable[index1];

        float frac = phase - index0;

        float sample = sample0 + (sample1 - sample0) * frac;

        outputBuffer[i] = sample;
        incrementPhase();
    }
}


void GainNode::setGainControl(float gainControl) {
    this->gainControl = gainControl;
}

float GainNode::getGainControl(){
    return this->gainControl;
}

void GainNode::process() {
    std::vector<float>& inputBuffer = inputNodes[0]->outputBuffer;
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++) {
        outputBuffer[i] = inputBuffer[i] * gainControl;
    }
}


void MixerNode::onInputAdded() {
    mixerAmplitudes.push_back(1.0f);
}

void MixerNode::onInputRemoved(size_t index) {
    mixerAmplitudes.erase(mixerAmplitudes.begin() + index);
}

void MixerNode::updateAmplitude(AudioNode* node, float amplitude) {
    auto it = std::find(inputNodes.begin(), inputNodes.end(), node);
    if (it != inputNodes.end()) {
        size_t index = it - inputNodes.begin();
        mixerAmplitudes[index] = amplitude;
    }
}

void MixerNode::process() {
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++) {
        float sample = 0.0f;
        float mixerSum = 0.0f;
        for (int j = 0; j < inputNodes.size(); j++) {
            sample += inputNodes[j]->outputBuffer[i] * mixerAmplitudes[j];
            mixerSum += mixerAmplitudes[j];
        }
        if (mixerSum > 0.0f) {
            sample /= mixerSum;
        } else sample = 0;
        outputBuffer[i] = sample;
    }
}


void OutputNode::process() {
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++) {
        outputBuffer[i] = inputNodes[0]->outputBuffer[i];
    }
}

const std::vector<float>& OutputNode::getBuffer() {
    return outputBuffer;
}
