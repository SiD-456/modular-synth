import { useState } from 'react';
import Navbar from './Navbar.tsx'
import './App.css'
import Sidebar from './Sidebar.tsx'
import Canvas from './Canvas.tsx'
import '@xyflow/react/dist/style.css'

function App() {

  const [isPlaying, setIsPlaying] = useState(false);
  const onPlayPause = () => {
    setIsPlaying(!isPlaying);
  }

  return(<>
  <div className = "layout">
    <Navbar 
    isPlaying = {isPlaying}
    onPlayPause={onPlayPause}
  />  
  <Sidebar />
  <Canvas />
  </div>
  </>
  )
}


export default App