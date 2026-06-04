import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <p className="landing-title"><p className="topheading">Clean Street</p></p>
        <p className="landing-title">
          <Link to="/login"><button>Login</button></Link>
          <Link to="/register"><button>Register</button></Link>
        </p>
      </header>

 <div class="container2">
        <div class="box_1">
            <div class="box_2">
                <div class="box_3">
                </div>
            </div>
        </div>
    </div>

      {/* Content */}
      <div className="landing-content">
        <h1 style={{ color: '#fff' }}>Welcome to Clean Street</h1>
        <p>Report issues, volunteer, and manage your community together.</p>
      <div class="container">
        <div class="box_1">
            <div class="box_2">
                <div class="box_3">
                </div>
            </div>
        </div>
    </div>
  </div>

  <div class="container1">
        <div class="box_1">
            <div class="box_2">
                <div class="box_3">
                </div>
            </div>
        </div>
    </div>

      <div className="landing-footer-logo">
        <img src="/Clogo.png" alt="Clean Street Logo" />
      </div>
    </div>
  );
}

export default LandingPage;
