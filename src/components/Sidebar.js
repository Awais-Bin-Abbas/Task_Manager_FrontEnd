import React, { Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Wrapper to use hooks in class component
function SidebarWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  return <Sidebar navigate={navigate} location={location} />;
}

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordRequests: [],
      showRequestsModal: false,
      resolvingId: null,
      newPasswords: {}
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
      console.log('Failed to fetch password requests:', err.message);
    }
  };

  handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.props.navigate('/login');
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
    if (!newPassword) return;

    this.setState({ resolvingId: id });
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://127.0.0.1:8000/auth/resolve-password-request/', {
        request_id: id,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.setState(prevState => ({
        passwordRequests: prevState.passwordRequests.filter(req => req.id !== id),
        newPasswords: { ...prevState.newPasswords, [id]: '' }
      }));
      alert(`Password updated for ${username}.`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      this.setState({ resolvingId: null });
    }
  };

  render() {
    const role = localStorage.getItem('role');
    const isManager = role === 'Manager';
    const currentPath = this.props.location.pathname;
    const { passwordRequests, showRequestsModal, resolvingId, newPasswords } = this.state;

    const navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/tasks', label: 'Tasks', icon: '📋' },
      { path: '/projects', label: 'Projects', icon: '📂' },
      { path: '/teams', label: 'Teams', icon: '👥' },
      { path: '/analytics', label: 'Analytics', icon: '📊' },
    ];

    if (isManager) {
      navItems.push({ path: '/users', label: 'Users', icon: '👤' });
    }

    return (
      <div className="sidebar">
        <div className="sidebar-brand text-center">
          <h2 className="text-primary mb-1">TaskFlow</h2>
          <p className="text-muted small mb-0">Management System</p>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link-custom ${currentPath === item.path ? 'active' : ''}`}
            >
              <span className="me-2">{item.icon}</span> {item.label}
            </Link>
          ))}

          {isManager && (
            <button 
              className="btn btn-link nav-link-custom w-100 text-start position-relative border-0 bg-transparent"
              onClick={this.toggleRequestsModal}
            >
              <span className="me-2">🔔</span> Requests
              {passwordRequests.length > 0 && (
                <span className="badge rounded-pill bg-danger ms-2">
                  {passwordRequests.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="d-flex align-items-center mb-3 px-2">
            <div className="bg-primary rounded-circle me-2" style={{width: '32px', height: '32px'}}></div>
            <div>
              <div className="small fw-bold">{role}</div>
              <div className="text-muted" style={{fontSize: '10px'}}>Active Session</div>
            </div>
          </div>
          <button className="btn btn-danger w-100 btn-sm" onClick={this.handleLogout}>
            Logout
          </button>
        </div>

        {/* Request Modal (migrated from navbar) */}
        {showRequestsModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content text-dark p-3">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Password Update Requests</h5>
                  <button type="button" className="btn-close" onClick={this.toggleRequestsModal}></button>
                </div>
                <div className="modal-body">
                  {passwordRequests.length === 0 ? (
                    <p className="text-center py-4">No pending requests.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>New Password</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passwordRequests.map(req => (
                          <tr key={req.id}>
                            <td>{req.username}</td>
                            <td>
                              <input 
                                type="password" 
                                className="form-control form-control-sm"
                                value={newPasswords[req.id] || ''}
                                onChange={(e) => this.handlePasswordChange(req.id, e.target.value)}
                              />
                            </td>
                            <td>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => this.handleResolveRequest(req.id, req.username)}
                                disabled={resolvingId === req.id}
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SidebarWrapper;
