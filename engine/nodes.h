#ifndef NODES_H
#define NODES_H

#include <vector>
#define CHUNKSIZE 128
class AudioGraph;

class WaveTable {
    public:
        int size;
        std::vector<float> waveTable;
        virtual void constructWaveTable() = 0;
        virtual ~WaveTable() = default;
};

class SineWaveTable : public WaveTable {
    public:
        SineWaveTable(int size);
        void constructWaveTable() override;
};

class AudioNode {
    public:
        int chunkSize = CHUNKSIZE;
        std::vector<AudioNode*> inputNodes;
        std::vector<AudioNode*> outputNodes;
        std::vector<float> outputBuffer;
        virtual void process() = 0;
        virtual ~AudioNode() = default;
        virtual int minInputs() const = 0;
        virtual int maxInputs() const = 0;
        virtual int minOutputs() const = 0;
        virtual int maxOutputs() const = 0;
        int id;

        void setId(int id);
        int getId();
        bool addInput(AudioNode* node);
        bool addOutput(AudioNode* node);
        bool removeInput(AudioNode* node);
        bool removeOutput(AudioNode* node);

    protected:
        virtual void onInputAdded() {};
        virtual void onInputRemoved(size_t index) {};
};

class OscillatorNode : public AudioNode {
    private:
        float phase = 0.0f;
        float phaseInc = 0.0f;
        float frequency = 440.0f;
        int sampleRate = 44100;
        const WaveTable* table;

    public:
        int minInputs() const override {return 0;}
        int maxInputs() const override {return 0;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}

        OscillatorNode(const AudioGraph* graph, const WaveTable* wt);

        void changeWaveTable(WaveTable* wt);
        void updatePhaseInc();
        void setSampleRate(int sampleRate);
        void setFrequency(float frequency);
        float getFrequency();
        void incrementPhase();
        void process() override;
};

class GainNode : public AudioNode {
    public:
        int minInputs() const override {return 0;}
        int maxInputs() const override {return 1;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}
        float gainControl = 1.0f;

        void setGainControl(float gainControl);
        float getGainControl();
        void process() override;
};

class MixerNode : public AudioNode {
    public:
        int minInputs() const override {return 0;}
        int maxInputs() const override {return 3;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}
        std::vector<float> mixerAmplitudes;

        void onInputAdded() override;
        void onInputRemoved(size_t index) override;
        void updateAmplitude(AudioNode* node, float amplitude);
        void process() override;
};

class OutputNode : public AudioNode {
    public:
        int minInputs() const override {return 0;}
        int maxInputs() const override {return 1;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 0;}

        void process() override;
        const std::vector<float>& getBuffer();
};

#endif
