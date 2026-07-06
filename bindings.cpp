#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "graph.h"
#include "nodes.h"

using namespace emscripten;

// -----------------------------------------------------------------------
// std::vector<float> doesn't cross the JS boundary as a usable array on its
// own, so these small wrappers copy it into a real JS array (emscripten::val)
// at the call site. Fine for CHUNKSIZE-sized buffers; if you start pushing
// much larger buffers across, look at emscripten::val's typed-array/memory
// view helpers instead to avoid the copy.
// -----------------------------------------------------------------------
static val vecToJSArray(const std::vector<float>& vec) {
    return val::array(vec.begin(), vec.end());
}

EMSCRIPTEN_BINDINGS(audio_graph_module) {

    // AudioNode is abstract (pure virtual process/minInputs/etc.), so no
    // .constructor<>() here -- it exists purely so the shared API is visible
    // on any node handed back to JS, and so base<AudioNode> below can enable
    // automatic downcasting.
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
        .function("setSampleRate", &OscillatorNode::setSampleRate)
        .function("process", &OscillatorNode::process)
        // changeWaveTable(WaveTable*) intentionally left unbound for now --
        // WaveTable/SineWaveTable aren't exposed to JS yet. Add bindings for
        // those two classes first if you want to swap wavetables from JS.
        ;

    class_<GainNode, base<AudioNode>>("GainNode")
        .function("setGainControl", &GainNode::setGainControl)
        .function("process", &GainNode::process)
        ;

    class_<MixerNode, base<AudioNode>>("MixerNode")
        .function("updateAmplitude", &MixerNode::updateAmplitude, allow_raw_pointers())
        .function("process", &MixerNode::process)
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
        .function("connectNodes", &AudioGraph::connectNodes, allow_raw_pointers())
        .function("disconnectNodes", &AudioGraph::disconnectNodes, allow_raw_pointers())
        .function("processBuffer", +[](AudioGraph& self) -> val {
            return vecToJSArray(self.processBuffer());
        })
        ;
}
