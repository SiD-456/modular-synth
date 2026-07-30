import { useState } from 'react';
import Navbar from './Navbar.tsx'
import './App.css'
import Sidebar from './Sidebar.tsx'
import Canvas from './Canvas.tsx'
import OscillatorNode from './nodes/Oscillator.tsx';
import GainNode from './nodes/Gain.tsx';
import MixerNode from './nodes/Mixer.tsx'
import OutputNode from './nodes/Output.tsx';
import ADSRNode from './nodes/Adsr.tsx';
import KeyboardNode from './nodes/Keyboard.tsx';
import { useEdgesState, useNodesState } from '@xyflow/react';
import type { Node, Edge } from "@xyflow/react"
import { useEffect } from 'react';

const nodeTypes = {
  OscillatorNode: OscillatorNode,
  GainNode: GainNode,
  OutputNode: OutputNode,
  MixerNode: MixerNode,
  KeyboardNode: KeyboardNode,
  ADSRNode: ADSRNode
}

const nodeList = [
  "OscillatorNode",
  "GainNode",
  "OutputNode",
  "MixerNode",
  "KeyboardNode",
  "ADSRNode",
]

function App({ engine }: any) {

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);


  const [isPlaying, setIsPlaying] = useState(false);

const onPlayPause = async () => {
    if (isPlaying) {
        await engine.pause();
        setIsPlaying(false);
    } else {
        await engine.play();
        setIsPlaying(true);
    }
};

useEffect(() => {
        const unlock = async () => {
            if (engine.context.state === "suspended") {
                await engine.play();
            }
            window.removeEventListener("pointerdown", unlock);
        };

        window.addEventListener("pointerdown", unlock);

        return () => {
            window.removeEventListener("pointerdown", unlock);
        };
    }, [engine]);


  async function createNode(node: string) {
    if(node === "KeyboardNode"){
      console.log("hi");
      const newNode = {
      id: crypto.randomUUID(),
      type: node,
      position: { x: 100, y: 100 + nodes.length * 110 },
      data: { engine }
    };

    setNodes(nodes => [...nodes, newNode]);
    return;
    }
    const nodeId = await engine.addNode(node);
    const newNode = {
      id: crypto.randomUUID(),
      type: node,
      position: { x: 100, y: 100 + nodes.length * 110 },
      data: { engine, nodeId}
    };

    setNodes(nodes => [...nodes, newNode]);
  }

  return (<>
    <div className="layout">
      <Navbar/>
      <Sidebar nodeList={nodeList}
        createNode={createNode}
      />
      <Canvas
        engine = {engine}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
      />
    </div>
  </>
  )
}

export default App