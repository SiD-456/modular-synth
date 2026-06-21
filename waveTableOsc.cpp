#include <bits/stdc++.h>
#include <fstream>
constexpr double PI = 3.14159265358979323846;
using namespace std;

struct sineWaveTable
{
    // Will have code to generate and store the wavetable
    int size;
    vector<float> waveTable;
    sineWaveTable() : size(512),
                      waveTable(size)
    {
        for (int i = 0; i < size; i++)
        {
            waveTable[i] = sin(2 * PI * i / size);
        }
    }
};

class waveTableOsc
{
    /*Will have access to a wavetable, store the index of the wavetable sample.
    Will have functions to calculate index increment, function to update frequency and sample rate.
    A get Output function that will return a sample to be stored in an audio buffer.
    Instead of using index to get the sample use a phase.
    */
private:
    float phase = 0.0f;
    float phaseInc = 0.0f;
    float frequency = 440.0f;
    int sampleRate = 44100;
    sineWaveTable &table;

public:
    waveTableOsc(sineWaveTable &wt) : table(wt)
    {
        updatePhaseInc();
    };

    void updatePhaseInc()
    {
        this->phaseInc = table.size * frequency / sampleRate;
    }

    void setSampleRate(int sampleRate)
    {
        this->sampleRate = sampleRate;
        updatePhaseInc();
    }

    void setFrequency(float frequency)
    {
        this->frequency = frequency;
        updatePhaseInc();
    }

    void incrementPhase()
    {
        phase = phase + phaseInc;
        while (phase >= table.size)
        {
            phase -= table.size;
        }
    }

    float getSample()
    {
        int index0 = (int)phase;
        int index1 = (index0 + 1) % table.size;

        float sample0 = table.waveTable[index0];
        float sample1 = table.waveTable[index1];

        float frac = phase - index0;

        float sample = sample0 + (sample1 - sample0) * frac;

        incrementPhase();

        return sample;
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

int main()
{
    /*Initialize wavetable, initialize an oscillator, set frequency and sample rate.
    Generate empty buffers and fill them in by calling getOutput.
    Then append them to the wav file
    */
    int time = 3;
    int sampleRate = 44100;
    float frequency = 4400.0f;

    sineWaveTable swt;
    waveTableOsc osc(swt);

    osc.setFrequency(frequency);
    osc.setSampleRate(sampleRate);

    int numSamples = sampleRate * time;

    vector<float> audioBuffer;
    audioBuffer.reserve(numSamples);
    for (int i = 0; i < numSamples; i++)
    {
        audioBuffer.push_back(osc.getSample());
    }

    writeWav("sine.wav", audioBuffer, sampleRate);
}