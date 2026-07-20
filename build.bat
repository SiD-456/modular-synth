@echo off

cd emsdk
call emsdk_env.bat
cd ..

emcc engine/graph.cpp engine/nodes.cpp engine/bindings.cpp ^
    -std=c++17 ^
    --bind ^
    -s MODULARIZE=1 ^
    -s EXPORT_ES6=1 ^
    -s EXPORT_NAME="createAudioModule" ^
    -s ALLOW_MEMORY_GROWTH=1 ^
    -s SINGLE_FILE=1 ^
    -O2 ^
    -o frontend/src/modules/audio_module.js

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build completed successfully!
pause