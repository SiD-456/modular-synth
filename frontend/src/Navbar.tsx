import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import './Navbar.css'

type NavbarProps = {
    isPlaying : boolean;
    onPlayPause: () => void;
}

function MyNavbar() {
    return (
        <Navbar bg="dark" variant="dark" className="navbar" >
            <div className = "navbar-layout">
                <Navbar.Brand
                className = "brand"
                >
                Synth
                </Navbar.Brand>

                <h5 className = "title">Untitled Project</h5>
            </div>
            
        </Navbar>
    );
}

export default MyNavbar;