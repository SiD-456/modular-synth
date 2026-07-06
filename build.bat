emcc graph.cpp nodes.cpp bindings.cpp -std=c++17 --bind -s MODULARIZE=1 -s EXPORT_NAME="createAudioModule" -s ALLOW_MEMORY_GROWTH=1 -O2 -o audio_module.js
