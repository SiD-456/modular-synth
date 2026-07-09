import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import './Navbar.css'

type NavbarProps = {
    isPlaying : boolean;
    onPlayPause: () => void;
}

function MyNavbar({isPlaying, onPlayPause}: NavbarProps) {
    return (
        <Navbar bg="dark" variant="dark" className="navbar" >
            <div className = "navbar-layout">
                {/*Brand - Left*/}
                <Navbar.Brand
                className = "brand"
                >
                Synth
                </Navbar.Brand>

                {/* Title - Center*/}

                <h5 className = "title">Untitled Project</h5>

                {/* Control Panel - Right */}
                <div className = "control-panel">
                    <Button onClick = {onPlayPause}>
                        {isPlaying ? "Pause" : "Play"}
                    </Button>
                </div>
            </div>
            
        </Navbar>
    );
}

                    // <Button onClick={onPlayPause}>
                    //     {isPlaying ? "Pause" : "Play"}
                    // </Button>


export default MyNavbar;