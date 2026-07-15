import { useState } from 'react';
import Navbar from './Navbar.tsx'
import './App.css'
import Sidebar from './Sidebar.tsx'
import Canvas from './Canvas.tsx'
import OscillatorNode from './nodes/Oscillator.tsx';
import GainNode from './nodes/Gain.tsx';
import OutputNode from './nodes/Output.tsx';
import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import type { Node, Edge } from "@xyflow/react"
import { useEffect, useRef } from "react";
import createAudioModule from "./modules/audio_module.js";

const nodeTypes = {
    OscillatorNode: OscillatorNode,
    GainNode: GainNode,
    OutputNode: OutputNode
  }

function App() {

  const nodeList = [
    "OscillatorNode",
    "GainNode",
    "OutputNode"
  ]
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);


  const [isPlaying, setIsPlaying] = useState(false);
  const onPlayPause = () => {
    setIsPlaying(!isPlaying);
  }

  const graphRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      const engine = await createAudioModule();
      graphRef.current = new engine.AudioGraph;
    }

    init();
  }, [])

  function createNode(node: string) {
    const newNode = {
      id: crypto.randomUUID(),
      type: node,
      position: {x: 100, y: 100},
      data: {}
    }

    setNodes((nodes)=>{
      return [...nodes, newNode];
    })

    const cppNode = graphRef.current.addNode(node);
    console.log(cppNode);
  }

  return (<>
    <div className="layout">
      <Navbar
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
      />
      <Sidebar nodeList={nodeList}
        createNode={createNode}
      />
      <Canvas
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