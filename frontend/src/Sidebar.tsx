import './Sidebar.css'
import Button from "react-bootstrap/Button";

type SidebarProps = {
  nodeList: string[]
  createNode: (node: string) => void 
};

function Sidebar({ nodeList, createNode }: SidebarProps) {
  return (
    <div className="sidebar">
      {nodeList.map((node) => (
        <Button className="node-button" key={node}
        onClick = {() => {createNode(node)}}
        >
          <div className="node-icon">+</div>
          <div className="node-label">{node}</div>
        </Button>
      ))}
    </div>
  );
}

export default Sidebar;