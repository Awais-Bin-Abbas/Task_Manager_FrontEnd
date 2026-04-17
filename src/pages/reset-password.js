import React, { Component } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const username = searchParams.get('username');

  return <ResetPassword navigate={navigate} token={token} username={username} />;
}

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: '',
      confirmPassword: '',
      error: '',
      message: '',
      loading: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleResetPassword = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = this.state;
    const { token, username } = this.props;

    if (newPassword !== confirmPassword) {
      this.setState({ error: 'Passwords do not match.', message: '' });
      return;
    }

    if (!token || !username) {
      this.setState({ error: 'Invalid link. Missing token or username.', message: '' });
      return;
    }

    this.setState({ error: '', message: '', loading: true });

    try {
      await axios.post('http://127.0.0.1:8000/auth/reset-password/', {
        username: username,
        token: token,
        new_password: newPassword
      });

      this.setState({
        message: 'Password has been reset successfully. An email with the new password has been sent to the user.',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Optionally redirect after a few seconds
      setTimeout(() => {
        this.props.navigate('/login');
      }, 5000);

    } catch (err) {
      console.log('Reset password error:', err.response?.data || err.message);
      this.setState({
        error: err.response?.data?.detail || 'Failed to reset password. Please try again or request a new link.'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newPassword, confirmPassword, error, message, loading } = this.state;
    const { username } = this.props;

    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow" style={{ width: '420px' }}>
          <div className="card-body p-5">

            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary">TaskFlow</h1>
              <p className="text-muted">Manager Access</p>
            </div>

            <h4 className="text-center mb-4">Reset User Password</h4>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <p className="text-muted small mb-4 text-center">
              Set a new password for user <strong>{username}</strong>. The user will be notified via email.
            </p>

            <form onSubmit={this.handleResetPassword}>
              <input
                type="password"
                name="newPassword"
                className="form-control mb-2"
                placeholder="New Password"
                value={newPassword}
                onChange={this.handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                className="form-control mb-3"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={this.handleChange}
                required
              />

              <button className="btn btn-primary w-100" disabled={loading || !!message}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center mt-3">
              <button 
                type="button" 
                className="btn btn-link text-decoration-none text-muted" 
                onClick={() => this.props.navigate('/login')}
              >
                Back to Login
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default ResetPasswordWrapper;
