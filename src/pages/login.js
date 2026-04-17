import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login navigate={navigate} />;
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      loading: false,
      showForgotPassword: false,
      forgotPasswordUsername: '',
      forgotPasswordMessage: '',
      forgotPasswordError: ''
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  toggleForgotPassword = () => {
    this.setState(prevState => ({
      showForgotPassword: !prevState.showForgotPassword,
      forgotPasswordUsername: '',
      forgotPasswordMessage: '',
      forgotPasswordError: ''
    }));
  };

  handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    this.setState({ forgotPasswordError: '', forgotPasswordMessage: '', loading: true });

    try {
      // Endpoint to request password reset (sends email to manager)
      await axios.post('http://127.0.0.1:8000/auth/forgot-password/', {
        username: this.state.forgotPasswordUsername
      });

      this.setState({
        forgotPasswordMessage: 'If the user exists, your request has been sent to the Manager for approval.'
      });
    } catch (err) {
      console.log('Forgot password error:', err.response?.data || err.message);
      this.setState({
        forgotPasswordError: err.response?.data?.detail || 'Failed to request password reset. Please try again.'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleLogin = async (e) => {
    e.preventDefault();
    this.setState({ error: '', loading: true });

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/login/', {
        username: this.state.username,
        password: this.state.password
      });

      const { access, refresh } = response.data;

      // Decode token to get role and expiry
      const decoded = jwtDecode(access);

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('role', decoded.role || '');
      localStorage.setItem('tokenExpiry', decoded.exp);

      // If backend sends user object, store it too
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      this.props.navigate('/dashboard');

    } catch (err) {
      console.log('Login error:', err.response?.data || err.message);
      this.setState({
        error: err.response?.data?.detail || 'Invalid username or password. Please try again.'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { 
      username, password, error, loading, 
      showForgotPassword, forgotPasswordUsername, forgotPasswordMessage, forgotPasswordError 
    } = this.state;

    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow" style={{ width: '420px' }}>
          <div className="card-body p-5">

            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary">TaskFlow</h1>
              <p className="text-muted">Task Management System</p>
            </div>

            {!showForgotPassword ? (
              <>
                <h4 className="text-center mb-4">Login</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={this.handleLogin}>
                  <input
                    name="username"
                    className="form-control mb-2"
                    placeholder="Username"
                    value={username}
                    onChange={this.handleChange}
                  />

                  <input
                    type="password"
                    name="password"
                    className="form-control mb-3"
                    placeholder="Password"
                    value={password}
                    onChange={this.handleChange}
                  />

                  <button className="btn btn-primary w-100 mb-3" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      className="btn btn-link text-decoration-none" 
                      onClick={this.toggleForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h4 className="text-center mb-4">Reset Password</h4>
                
                {forgotPasswordError && <div className="alert alert-danger">{forgotPasswordError}</div>}
                {forgotPasswordMessage && <div className="alert alert-success">{forgotPasswordMessage}</div>}

                <p className="text-muted small mb-4 text-center">
                  Enter your username. An email will be sent to the manager with a link to reset your password.
                </p>

                <form onSubmit={this.handleForgotPasswordSubmit}>
                  <input
                    name="forgotPasswordUsername"
                    className="form-control mb-3"
                    placeholder="Username"
                    value={forgotPasswordUsername}
                    onChange={this.handleChange}
                    required
                  />

                  <button className="btn btn-primary w-100 mb-3" disabled={loading || !!forgotPasswordMessage}>
                    {loading ? 'Sending Request...' : 'Send Request'}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      className="btn btn-link text-decoration-none text-muted" 
                      onClick={this.toggleForgotPassword}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default LoginWrapper;