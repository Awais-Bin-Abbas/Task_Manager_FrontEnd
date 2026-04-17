import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggle from './DarkModeToggle';

// Wrapper to use hooks in class component
function NavbarWrapper() {
  const navigate = useNavigate();
  return <Navbar navigate={navigate} />;
}

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordRequests: [],
      showRequestsModal: false,
      resolvingId: null,
      newPasswords: {} // Store new passwords keyed by request id
    };
  }

  componentDidMount() {
    const role = localStorage.getItem('role');
    if (role === 'Manager') {
      this.fetchPasswordRequests();
    }
  }

  fetchPasswordRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/auth/password-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ passwordRequests: response.data });
    } catch (err) {
      console.log('Failed to fetch password requests:', err.response?.data || err.message);
      this.setState({ passwordRequests: [] });
    }
  };

  toggleRequestsModal = () => {
    this.setState(prevState => ({ showRequestsModal: !prevState.showRequestsModal }));
  };

  handlePasswordChange = (id, value) => {
    this.setState(prevState => ({
      newPasswords: { ...prevState.newPasswords, [id]: value }
    }));
  };

  handleResolveRequest = async (id, username) => {
    const newPassword = this.state.newPasswords[id];
    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }

    this.setState({ resolvingId: id });

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://127.0.0.1:8000/auth/resolve-password-request/', {
        request_id: id,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Password updated for ${username}. An email has been sent.`);
      
      // Remove from list
      this.setState(prevState => ({
        passwordRequests: prevState.passwordRequests.filter(req => req.id !== id),
        newPasswords: { ...prevState.newPasswords, [id]: '' }
      }));

    } catch (err) {
      alert('Failed to update password. ' + (err.response?.data?.detail || err.message));
    } finally {
      this.setState({ resolvingId: null });
    }
  };

  handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    alert("Logged out successfully! 👋");

    this.props.navigate('/login');
  };

  render() {
    const role = localStorage.getItem('role');
    const isManager = role === 'Manager';
    const { passwordRequests, showRequestsModal, resolvingId, newPasswords } = this.state;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3 mb-4">
        <div className="container">

          {/* Brand */}
          <Link className="navbar-brand fw-bold fs-3" to="/dashboard">
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
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link px-3" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/tasks">Tasks</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/projects">Projects</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/teams">Teams</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/analytics">Analytics</Link>
              </li>
              {isManager && (
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/users">Users</Link>
                </li>
              )}
            </ul>

            {/* Right side controls */}
            <div className="d-flex align-items-center">
              {isManager && (
                <button 
                  className="btn btn-warning btn-sm me-3 position-relative fw-bold"
                  onClick={this.toggleRequestsModal}
                >
                  Requests
                  {passwordRequests.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {passwordRequests.length}
                    </span>
                  )}
                </button>
              )}

              <DarkModeToggle />

              <button
                className="btn btn-outline-light btn-sm ms-3 fw-bold"
                onClick={this.handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Password Requests Modal */}
        {showRequestsModal && isManager && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content text-dark shadow-lg border-0" style={{borderRadius: '15px'}}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Password Update Requests</h5>
                  <button type="button" className="btn-close" onClick={this.toggleRequestsModal}></button>
                </div>
                <div className="modal-body p-4">
                  {passwordRequests.length === 0 ? (
                    <p className="text-muted text-center py-4">No pending requests.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Requested At</th>
                            <th>New Password</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {passwordRequests.map(req => (
                            <tr key={req.id}>
                              <td className="fw-bold">{req.username}</td>
                              <td>{new Date(req.requested_at).toLocaleString()}</td>
                              <td>
                                <input 
                                  type="password" 
                                  className="form-control form-control-sm" 
                                  placeholder="New password"
                                  value={newPasswords[req.id] || ''}
                                  onChange={(e) => this.handlePasswordChange(req.id, e.target.value)}
                                />
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => this.handleResolveRequest(req.id, req.username)}
                                  disabled={resolvingId === req.id || !newPasswords[req.id]}
                                >
                                  {resolvingId === req.id ? '...' : 'Update'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    );

  }
}

export default NavbarWrapper;