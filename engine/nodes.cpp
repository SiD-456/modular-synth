#include "nodes.h"
#include "graph.h"
#include <cmath>
#include <algorithm>

constexpr double PI = 3.14159265358979323846;

// WaveTable
SineWaveTable::SineWaveTable(int size)
{
    this->size = size;
    constructWaveTable();
}

void SineWaveTable::constructWaveTable()
{
    waveTable.resize(size);
    for (int i = 0; i < size; i++)
    {
        waveTable[i] = (sin(2 * PI * i / size));
    }
}

SawWaveTable::SawWaveTable(int size)
{
    this->size = size;
    constructWaveTable();
}

void SawWaveTable::constructWaveTable()
{
    waveTable.resize(size);
    for (int i = 0; i < size; i++)
    {
        waveTable[i] = 1.0f - 2.0f * static_cast<float>(i) / size;
    }
}

SquareWaveTable::SquareWaveTable(int size)
{
    this->size = size;
    constructWaveTable();
}

void SquareWaveTable::constructWaveTable()
{
    waveTable.resize(size);
    for (int i = 0; i < size; i++)
    {
        if (i < size / 2)
            waveTable[i] = 1;
        else
            waveTable[i] = -1;
    }
}

TriangleWaveTable::TriangleWaveTable(int size) {
    this->size = size;
    constructWaveTable();
}

void TriangleWaveTable::constructWaveTable()
{
    waveTable.resize(size);

    for (int i = 0; i < size; ++i)
    {
        float x = static_cast<float>(i) / size;
        waveTable[i] = 1.0f - 4.0f * std::abs(x - 0.5f);
    }
}

// AudioNode base class
void AudioNode::setId(int id)
{
    this->id = id;
}

int AudioNode::getId()
{
    return this->id;
}

bool AudioNode::addInput(AudioNode *node)
{
    if (inputNodes.size() >= maxInputs())
    {
        return false;
    }
    else
    {
        inputNodes.push_back(node);
        onInputAdded();
        return true;
    }
}

bool AudioNode::addOutput(AudioNode *node)
{
    if (outputNodes.size() >= maxOutputs())
    {
        return false;
    }
    else
    {
        outputNodes.push_back(node);
        return true;
    }
}

bool AudioNode::removeInput(AudioNode *node)
{
    if (inputNodes.size() <= minInputs())
    {
        return false;
    }
    else
    {
        auto it = std::find(inputNodes.begin(), inputNodes.end(), node);

        if (it != inputNodes.end())
        {
            size_t index = it - inputNodes.begin();
            inputNodes.erase(it);
            onInputRemoved(index);
            return true;
        }

        return false;
    }
}

bool AudioNode::removeOutput(AudioNode *node)
{
    if (outputNodes.size() <= minOutputs())
    {
        return false;
    }
    else
    {
        auto it = std::find(outputNodes.begin(), outputNodes.end(), node);

        if (it != outputNodes.end())
        {
            outputNodes.erase(it);
            return true;
        }

        return false;
    }
}

// Oscillator
OscillatorNode::OscillatorNode(const AudioGraph *graph, const WaveTable *wt) : table(wt)
{
    updatePhaseInc();
    setSampleRate(graph->sampleRate);
}

void OscillatorNode::changeWaveTable(WaveTable *wt)
{
    table = wt;
    updatePhaseInc();
}

void OscillatorNode::updatePhaseInc()
{
    phaseInc = table->size * frequency / sampleRate;
}

void OscillatorNode::setSampleRate(int sampleRate)
{
    this->sampleRate = sampleRate;
    updatePhaseInc();
}

void OscillatorNode::setFrequency(float frequency)
{
    this->frequency = frequency;
    updatePhaseInc();
}

float OscillatorNode::getFrequency()
{
    return this->frequency;
}

void OscillatorNode::incrementPhase()
{
    phase += phaseInc;
    while (phase >= table->size)
    {
        phase -= table->size;
    }
}

void OscillatorNode::process()
{
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++)
    {
        int index0 = (int)phase;
        int index1 = (index0 + 1) % table->size;

        float sample0 = table->waveTable[index0];
        float sample1 = table->waveTable[index1];

        float frac = phase - index0;

        float sample = sample0 + (sample1 - sample0) * frac;
        sample *= level;

        outputBuffer[i] = sample;
        incrementPhase();
    }
}

// Gain
void GainNode::setGainControl(float gainControl)
{
    this->gainControl = gainControl;
}

float GainNode::getGainControl()
{
    return this->gainControl;
}

void GainNode::process()
{
    if(inputNodes.size() == 0){
        std::fill(outputBuffer.begin(), outputBuffer.end(), 0.0f);
        return;
    }
    
    std::vector<float> &inputBuffer = inputNodes[0]->outputBuffer;
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++)
    {
        outputBuffer[i] = inputBuffer[i] * gainControl;
    }
}

// Mixer
void MixerNode::onInputAdded()
{
    mixerAmplitudes.push_back(1.0f);
}

void MixerNode::onInputRemoved(size_t index)
{
    mixerAmplitudes.erase(mixerAmplitudes.begin() + index);
}

void MixerNode::updateAmplitude(AudioNode *node, float amplitude)
{
    auto it = std::find(inputNodes.begin(), inputNodes.end(), node);
    if (it != inputNodes.end())
    {
        size_t index = it - inputNodes.begin();
        mixerAmplitudes[index] = amplitude;
    }
}

void MixerNode::process()
{
    outputBuffer.resize(chunkSize);
    if(inputNodes.size() == 0){
        std::fill(outputBuffer.begin(), outputBuffer.end(), 0.0f);
        return;
    }
    for (int i = 0; i < chunkSize; i++)
    {
        float sample = 0.0f;
        for (int j = 0; j < inputNodes.size(); j++)
        {
            sample += inputNodes[j]->outputBuffer[i] * mixerAmplitudes[j];
        }
        outputBuffer[i] = sample;
    }
}

// ADSR envelope
ADSRNode::ADSRNode(const AudioGraph *graph)
{
    this->sampleRate = graph->sampleRate;
}

float ADSRNode::getAttack() const
{
    return attackTime;
}

float ADSRNode::getDecay() const
{
    return decayTime;
}

float ADSRNode::getSustain() const
{
    return sustainLevel;
}

float ADSRNode::getRelease() const
{
    return releaseTime;
}

void ADSRNode::setAttack(float attackTime)
{
    this->attackTime = std::max(0.01f, attackTime);
}

void ADSRNode::setDecay(float decayTime)
{
    this->decayTime = std::max(0.01f, decayTime);
}

void ADSRNode::setSustain(float sustainLevel)
{
    this->sustainLevel = std::clamp(sustainLevel, 0.0f, 1.0f);
}

void ADSRNode::setRelease(float releaseTime)
{
    this->releaseTime = std::max(0.01f, releaseTime);
}

void ADSRNode::updateIncrement()
{
    switch (state)
    {
    case EnvelopeState::Idle:
        increment = 0.0f;
        break;
    case EnvelopeState::Attack:
        increment = (1.0f - level) / (attackTime * sampleRate);
        break;
    case EnvelopeState::Decay:
        increment = (sustainLevel - level) / (decayTime * sampleRate);
        break;
    case EnvelopeState::Sustain:
        increment = 0.0f;
        break;
    case EnvelopeState::Release:
        increment = (0.0f - level) / (releaseTime * sampleRate);
        break;
    }
}

void ADSRNode::keyDown()
{
    //level = 0.0f; Reset level to 0.0f to remove legato effect.
    state = EnvelopeState::Attack;
    updateIncrement();
}

void ADSRNode::keyUp()
{
    state = EnvelopeState::Release;
    updateIncrement();
}

void ADSRNode::process()
{
    if(inputNodes.size() == 0){
        std::fill(outputBuffer.begin(), outputBuffer.end(), 0.0f);
        return;
    }

    float epsilon = 0.0001f;
    outputBuffer.resize(chunkSize);
    for (int i = 0; i < chunkSize; i++)
    {
        if (state == EnvelopeState::Attack && level >= 1)
        {
            level = 1;
            state = EnvelopeState::Decay;
            updateIncrement();
        }
        else if (state == EnvelopeState::Decay && (std::abs(level - sustainLevel) <= epsilon || level <= sustainLevel))
        {
            level = sustainLevel;
            state = EnvelopeState::Sustain;
            updateIncrement();
        }
        else if (state == EnvelopeState::Release && (std::abs(level - 0.0f) <= epsilon || level <= 0.0f))
        {
            level = 0.0f;
            state = EnvelopeState::Idle;
            updateIncrement();
        }
        level = std::clamp(level, 0.0f, 1.0f);
        outputBuffer[i] = inputNodes[0]->outputBuffer[i] * level;
        level += increment;
    }
}

// Output
void OutputNode::process()
{
    outputBuffer.resize(chunkSize);
    if(inputNodes.size() == 0){
        std::fill(outputBuffer.begin(), outputBuffer.end(), 0.0f);
        return;
    }

    for (int i = 0; i < chunkSize; i++)
    {
        outputBuffer[i] = inputNodes[0]->outputBuffer[i];
    }
}

const std::vector<float> &OutputNode::getBuffer()
{
    return outputBuffer;
}
