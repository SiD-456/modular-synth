import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Engine from './Engine.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@xyflow/react/dist/style.css'

async function main() {
    const engine = await Engine.create();

    createRoot(document.getElementById("root")!).render(
        <App engine={engine} />
    );
}

main();