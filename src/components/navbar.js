import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

// Wrapper to use hooks in class component
function NavbarWrapper() {
  const navigate = useNavigate();
  return <Navbar navigate={navigate} />;
}

class Navbar extends Component {

  handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    alert("Logged out successfully! 👋");

    this.props.navigate('/login');
  };

  render() {
    const role = localStorage.getItem('role');
    const isManager = role === 'Manager';
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container-fluid">

          {/* Brand */}
          <Link className="navbar-brand fw-bold fs-4" to="/dashboard">
            TaskFlow
          </Link>

          {/* Toggle button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar links */}
          <div className="collapse navbar-collapse" id="navbarNav">

            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/tasks">Tasks</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/projects">Projects</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/teams">Teams</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/analytics">Analytics</Link>
              </li>

              {/* Manager-only nav item */}
              {isManager && (
                <li className="nav-item">
                  <Link className="nav-link" to="/users">Users</Link>
                </li>
              )}

            </ul>

            {/* Right side controls */}
            <div className="d-flex align-items-center">

              <DarkModeToggle />

              <button
                className="btn btn-outline-light btn-sm ms-3"
                onClick={this.handleLogout}
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      </nav>
    );
  }
}

export default NavbarWrapper;