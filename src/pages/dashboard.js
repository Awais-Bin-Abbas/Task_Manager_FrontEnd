import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import axios from 'axios';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      passwordError: '',
      passwordMessage: '',
      loading: false,
      analytics: {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        overdue_tasks: 0
      }
    };
  }

  componentDidMount() {
    this.fetchAnalytics();
  }

  fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/analytics/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ analytics: response.data });
    } catch (err) {
      console.log('Failed to fetch analytics:', err.message);
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  togglePasswordModal = () => {
    this.setState(prevState => ({
      showPasswordModal: !prevState.showPasswordModal,
      oldPassword: '',
      newPassword: '',
      passwordError: '',
      passwordMessage: ''
    }));
  };

  handleChangePassword = async (e) => {
    e.preventDefault();
    this.setState({ passwordError: '', passwordMessage: '', loading: true });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      await axios.post('http://127.0.0.1:8000/auth/change-password/', {
        old_password: this.state.oldPassword,
        new_password: this.state.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.setState({
        passwordMessage: 'Password updated successfully.',
        oldPassword: '',
        newPassword: ''
      });
      
      setTimeout(() => {
        this.togglePasswordModal();
      }, 3000);
    } catch (err) {
      this.setState({
        passwordError: err.response?.data?.detail || 'Failed to change password.'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { showPasswordModal, oldPassword, newPassword, passwordError, passwordMessage, loading, analytics } = this.state;

    return (
      <>
        <NavbarWrapper />

        <div className="container mt-4 animate__animated animate__fadeIn">
          
          <div className="row mb-4 align-items-center">
            <div className="col">
              <h2 className="fw-bold mb-0">Dashboard Overview</h2>
              <p className="text-muted">Welcome back to TaskFlow.</p>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary shadow-sm" onClick={this.togglePasswordModal}>
                Update Password
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="card card-premium p-3 text-center">
                <div className="display-6 text-primary mb-2">{analytics.total_tasks}</div>
                <div className="text-muted fw-bold">Total Tasks</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-premium p-3 text-center border-start border-success border-4">
                <div className="display-6 text-success mb-2">{analytics.completed_tasks}</div>
                <div className="text-muted fw-bold">Completed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-premium p-3 text-center border-start border-warning border-4">
                <div className="display-6 text-warning mb-2">{analytics.in_progress_tasks}</div>
                <div className="text-muted fw-bold">In Progress</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-premium p-3 text-center border-start border-danger border-4">
                <div className="display-6 text-danger mb-2">{analytics.overdue_tasks}</div>
                <div className="text-muted fw-bold">Overdue</div>
              </div>
            </div>
          </div>



          {/* Modal Overlay */}
          {showPasswordModal && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{borderRadius: '16px'}}>
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold">Security Settings</h5>
                    <button type="button" className="btn-close" onClick={this.togglePasswordModal}></button>
                  </div>
                  <div className="modal-body p-4">
                    <p className="text-muted small mb-4">Update your password to keep your account secure.</p>
                    {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
                    {passwordMessage && <div className="alert alert-success py-2">{passwordMessage}</div>}
                    
                    <form onSubmit={this.handleChangePassword}>
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Current Password</label>
                        <input
                          type="password"
                          name="oldPassword"
                          className="form-control"
                          placeholder="••••••••"
                          value={oldPassword}
                          onChange={this.handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-bold small">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          className="form-control"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={this.handleChange}
                          required
                        />
                      </div>
                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary" disabled={loading || !!passwordMessage}>
                          {loading ? 'Processing...' : 'Save New Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default Dashboard;