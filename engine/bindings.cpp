#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "graph.h"
#include "nodes.h"

using namespace emscripten;

static val vecToJSArray(const std::vector<float>& vec) {
    return val::array(vec.begin(), vec.end());
}

EMSCRIPTEN_BINDINGS(audio_graph_module) {

    class_<AudioNode>("AudioNode")
        .function("setId", &AudioNode::setId)
        .function("getId", &AudioNode::getId)
        .function("addInput", &AudioNode::addInput, allow_raw_pointers())
        .function("addOutput", &AudioNode::addOutput, allow_raw_pointers())
        .function("removeInput", &AudioNode::removeInput, allow_raw_pointers())
        .function("removeOutput", &AudioNode::removeOutput, allow_raw_pointers())
        ;

    class_<OscillatorNode, base<AudioNode>>("OscillatorNode")
        .function("setFrequency", &OscillatorNode::setFrequency)
        .function("getFrequency", &OscillatorNode::getFrequency)
        .function("process", &OscillatorNode::process)
        ;
    
    class_<GainNode, base<AudioNode>>("GainNode")
        .function("setGainControl", &GainNode::setGainControl)
        .function("getGainControl", &GainNode::getGainControl)
        .function("process", &GainNode::process)
        ;

    class_<MixerNode, base<AudioNode>>("MixerNode")
        .function("updateAmplitude", &MixerNode::updateAmplitude, allow_raw_pointers())
        .function("process", &MixerNode::process)
        ;

    class_<ADSRNode, base<AudioNode>>("ADSRNode")
        .constructor<const AudioGraph*>()

        .function("keyDown", &ADSRNode::keyDown)
        .function("keyUp", &ADSRNode::keyUp)

        .function("getAttack", &ADSRNode::getAttack)
        .function("getDecay", &ADSRNode::getDecay)
        .function("getSustain", &ADSRNode::getSustain)
        .function("getRelease", &ADSRNode::getRelease)

        .function("setAttack", &ADSRNode::setAttack)
        .function("setDecay", &ADSRNode::setDecay)
        .function("setSustain", &ADSRNode::setSustain)
        .function("setRelease", &ADSRNode::setRelease)
        ;

    class_<OutputNode, base<AudioNode>>("OutputNode")
        .function("process", &OutputNode::process)
        .function("getBuffer", +[](OutputNode& self) -> val {
            return vecToJSArray(self.getBuffer());
        })
        ;

    class_<AudioGraph>("AudioGraph")
        .constructor<>()
        .function("addNode", &AudioGraph::addNode, allow_raw_pointers())
        .function("getNodeById", &AudioGraph::getNodeById, allow_raw_pointers())
        .function("removeNode", &AudioGraph::removeNode)
        .function("keyUp", &AudioGraph::keyUp)
        .function("keyDown", &AudioGraph::keyDown)
        .function("connectNodes", &AudioGraph::connectNodes, allow_raw_pointers())
        .function("disconnectNodes", &AudioGraph::disconnectNodes, allow_raw_pointers())
        .function("processBuffer", +[](AudioGraph& self) -> val {
            return vecToJSArray(self.processBuffer());
        })
        ;
}
