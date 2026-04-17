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
      loading: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
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
    const { username, password, error, loading } = this.state;

    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow" style={{ width: '420px' }}>
          <div className="card-body p-5">

            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary">TaskFlow</h1>
              <p className="text-muted">Task Management System</p>
            </div>

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

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          </div>
        </div>
      </div>
    );
  }
}

export default LoginWrapper;