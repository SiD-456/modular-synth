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
        int id;

        void setId(int id){
            this-> id = id;
        }

        int getId(){
            return this->id;
        }

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

class OscillatorNode : public AudioNode {
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

        OscillatorNode(WaveTable* wt) : table(wt) {
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

        const vector<float>& getBuffer () {
            return outputBuffer;
        }
};

class AudioGraph {
    private: 
        vector <unique_ptr<AudioNode>> audioNodes;
        int nextId = 0;
        vector<int> topologicalOrder;
        OutputNode* outputNode = nullptr;
        

    public:
        int addNode(unique_ptr<AudioNode> node){
            if (auto* out = dynamic_cast<OutputNode*>(node.get())) {
            outputNode = out;
            }

            node->setId(++this->nextId);
            int id = node->getId();
            audioNodes.push_back(move(node));  
            return id;
        }

        AudioNode* getNodeById(int id){
            for(int i = 0; i < audioNodes.size(); i++){
                if(audioNodes[i] -> getId() == id){
                    AudioNode* node = audioNodes[i].get();
                    return node;
                }
            }
            return nullptr;
        }

        bool removeNode(int id){
            for(int i = 0; i < audioNodes.size(); i++){
                if(audioNodes[i] -> getId() == id){
                    for (auto* input : audioNodes[i]->inputNodes){
                        input->removeOutput(audioNodes[i].get());
                    }

                    for (auto* output : audioNodes[i]->outputNodes){
                        output->removeInput(audioNodes[i].get());
                    }
                    audioNodes.erase(audioNodes.begin() + i);
                    topologicalSort();
                    return true;
                }
            }
            return false;
        }

        void connectNodes(int id1, int id2){
            AudioNode* node1 = getNodeById(id1);
            AudioNode* node2 = getNodeById(id2);
            node1->addOutput(node2);
            node2->addInput(node1);
            topologicalSort();
        }

        void disconnectNodes(int id1, int id2){
            AudioNode* node1 = getNodeById(id1);
            AudioNode* node2 = getNodeById(id2);
            node1->removeOutput(node2);
            node2->removeInput(node1);
        }

        void topologicalSort(){
            topologicalOrder.clear();
            queue <int> q;
            map<int, int> indegrees;
            for(int i = 0; i < audioNodes.size(); i++){
                indegrees[audioNodes[i]->getId()] = audioNodes[i]->inputNodes.size();
            }

            for(auto & [id, indegree] : indegrees){
                if(indegree == 0){
                    q.push(id);
                }
            }

            while(q.size() > 0){
                AudioNode* currentNode = getNodeById(q.front());
                for(AudioNode* node: currentNode->outputNodes){
                    indegrees[node->getId()]--;
                    if(indegrees[node->getId()] == 0){
                        q.push(node->id);
                    }
                }
                topologicalOrder.push_back(q.front());
                q.pop();
            }
        }

        vector <float> processBuffer(){
            for(int nodeId : topologicalOrder){
                AudioNode* node = getNodeById(nodeId);
                node->process();
            }

            return this->outputNode->getBuffer();
        }
};

void writeWav(const string &fileName, const vector<float> &samples, int sampleRate)
{
    ofstream file(fileName, ios::binary);

    int numSamples = samples.size();
    int dataSize = numSamples * sizeof(int16_t);

    file.write("RIFF", 4);
    int chunkSize = 36 + dataSize;
    file.write(reinterpret_cast<char *>(&chunkSize), 4);

    file.write("WAVE", 4);
    file.write("fmt ", 4);
    int subchunk1Size = 16;
    short audioFormat = 1; // PCM
    short numChannels = 1;
    int byteRate = sampleRate * numChannels * sizeof(int16_t);
    short blockAlign = numChannels * sizeof(int16_t);
    short bitsPerSample = 16;

    file.write(reinterpret_cast<char *>(&subchunk1Size), 4);
    file.write(reinterpret_cast<char *>(&audioFormat), 2);
    file.write(reinterpret_cast<char *>(&numChannels), 2);
    file.write(reinterpret_cast<char *>(&sampleRate), 4);
    file.write(reinterpret_cast<char *>(&byteRate), 4);
    file.write(reinterpret_cast<char *>(&blockAlign), 2);
    file.write(reinterpret_cast<char *>(&bitsPerSample), 2);

    file.write("data", 4);
    file.write(reinterpret_cast<char *>(&dataSize), 4);

    for (float sample : samples)
    {
        int16_t pcm = (int16_t)(sample * 32767.0f);
        file.write(reinterpret_cast<char *>(&pcm), sizeof(int16_t));
    }

    file.close();
}

int main() {
    AudioGraph graph;
    SineWaveTable swt(512);
    int osc = graph.addNode(make_unique<OscillatorNode>(&swt));
    int out = graph.addNode(make_unique<OutputNode>());

    graph.connectNodes(osc, out);

    int time = 3;
    int sampleRate = 44100;

    int totalSamples = time * sampleRate;
    int numChunks = (totalSamples + CHUNKSIZE - 1) / CHUNKSIZE;

    vector<float> data;
    data.reserve(totalSamples);

    for (int i = 0; i < numChunks; i++) {
        auto buffer = graph.processBuffer();
        data.insert(data.end(), buffer.begin(), buffer.end());
    }

    data.resize(totalSamples);

    writeWav("ModularSine.wav", data, sampleRate);

    return 0;
}