import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>IPL Scorecard</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/matches">Matches</Link>
        <Link to="/points">Points</Link>
        <Link to="/stats">Stats</Link>
        <Link to="/admin">Admin</Link>
      </div>
    </nav>
  );
}

export default Navbar;