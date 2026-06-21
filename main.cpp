#include <bits/stdc++.h>
#include <fstream>
constexpr double PI = 3.14159265358979323846;
using namespace std;

#define CHUNKSIZE 512

class WaveTable{
    public:
        int size;
        vector <float> waveTable;
        virtual void constructWaveTable() = 0;
        virtual ~WaveTable() = default;
};

class SineWaveTable : public WaveTable{
    public:
        SineWaveTable(int size){
            this -> size = size;
            constructWaveTable();
        }

        void constructWaveTable() override {
            waveTable.resize(size);
            for(int i = 0; i < size; i++){
                waveTable[i] = (sin(2 * PI * i / size));
            }
        }
};

class AudioNode {
    public:
        int chunkSize = CHUNKSIZE;
        vector <AudioNode*> inputNodes;
        vector <AudioNode*> outputNodes;
        vector <float> outputBuffer;
        virtual void process() = 0;
        virtual ~AudioNode() = default;
        virtual int minInputs() const = 0;
        virtual int maxInputs() const = 0;
        virtual int minOutputs() const = 0;
        virtual int maxOutputs() const = 0;

        bool addInput(AudioNode* node){
            if(inputNodes.size() >= maxInputs()){
                return false;
            }

            else{
                inputNodes.push_back(node);
                onInputAdded();
                return true;
            }
        }

        bool addOutput(AudioNode* node){
            if(outputNodes.size() >= maxOutputs()){
                return false;
            }
            else {
                outputNodes.push_back(node);
                return true;
            }
        }

        bool removeInput(AudioNode * node){
            if(inputNodes.size() <= minInputs()){
                return false;
            }
            
            else{
                auto it = find(inputNodes.begin(), inputNodes.end(), node);

                if(it != inputNodes.end()){
                    size_t index = it - inputNodes.begin();
                    inputNodes.erase(it);
                    onInputRemoved(index);
                    return true;
                }

                return false;
            }
        }

        bool removeOutput(AudioNode* node){
            if(outputNodes.size() <= minOutputs()){
                return false;
            }

            else {
                auto it = find(outputNodes.begin(), outputNodes.end(), node);

                if(it != outputNodes.end()){
                    outputNodes.erase(it);
                    return true;
                }

                return false;
            }
        }
    
    protected:
        virtual void onInputAdded() {};
        virtual void onInputRemoved(size_t index) {};

};

class OscNode : public AudioNode {
    // A wave table oscillator
    private:
        float phase = 0.0f;
        float phaseInc = 0.0f;
        float frequency = 440.0f;
        int sampleRate = 44100;
        WaveTable* table;

    public :
        int minInputs() const override {return 0;}
        int maxInputs() const override {return 0;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}

        OscNode(WaveTable* wt) : table(wt) {
            updatePhaseInc();
        }

        void changeWaveTable(WaveTable* wt){
            table = wt;
            updatePhaseInc();
        }

        void updatePhaseInc(){
            phaseInc = table->size * frequency / sampleRate;
        }

        void setSampleRate(int sampleRate){
            this -> sampleRate = sampleRate;
            updatePhaseInc();
        }

        void setFrequency(float frequency){
            this -> frequency = frequency;
            updatePhaseInc();
        }

        void incrementPhase(){
            phase += phaseInc;
            while(phase >= table->size){
                phase -= table->size;
            }
        }

        void process() override {
            outputBuffer.resize(chunkSize);
            for(int i = 0; i < chunkSize; i++){
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
};

class GainNode : public AudioNode {
    public:
        int minInputs() const override {return 1;}
        int maxInputs() const override {return 1;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}
        float gainControl = 1.0f;

        void setGainControl(float gainControl){
            this->gainControl = gainControl;
        }

        void process() override{
            vector <float> & inputBuffer = inputNodes[0] -> outputBuffer;
            outputBuffer.resize(chunkSize);
            for(int i = 0; i < chunkSize; i++){
                outputBuffer[i] = inputBuffer[i] * gainControl;
            }
        }
};

class MixerNode : public AudioNode {
    public:
        int minInputs() const override {return 1;}
        int maxInputs() const override {return 3;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 1;}
        vector <float> mixerAmplitudes;

        void onInputAdded() override{
            mixerAmplitudes.push_back(1.0f);
        }

        void onInputRemoved(size_t index) override{
            mixerAmplitudes.erase(mixerAmplitudes.begin() + index);
        }

        void updateAmplitude(AudioNode* node, float amplitude){
            auto it = find(inputNodes.begin(), inputNodes.end(), node);
            if(it != inputNodes.end()){
                size_t index = it - inputNodes.begin();
                mixerAmplitudes[index] = amplitude;
            }
        }

        void process() override {
            outputBuffer.resize(chunkSize);
            for(int i = 0; i < chunkSize; i++){
                float sample = 0.0f;
                float mixerSum = 0.0f;
                for(int j = 0; j < inputNodes.size(); j++){
                    sample += inputNodes[j] -> outputBuffer[i] * mixerAmplitudes[j];
                    mixerSum += mixerAmplitudes[j];
                }
                if(mixerSum > 0.0f){
                    sample /= mixerSum;
                }
                else sample = 0;
                outputBuffer[i] = sample;
            }
        }
};

class OutputNode : public AudioNode {
    public: 
        int minInputs() const override {return 1;}
        int maxInputs() const override {return 1;}
        int minOutputs() const override {return 0;}
        int maxOutputs() const override {return 0;}

        void process() override {
            outputBuffer.resize(chunkSize);
            for(int i = 0; i < chunkSize; i++){
                outputBuffer[i] = inputNodes[0] -> outputBuffer[i];
            }
        }

        float* getBuffer(){
            return outputBuffer.data();
        }

        int getBufferSize(){
            return outputBuffer.size();
        }
};

