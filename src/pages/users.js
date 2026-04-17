import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import API from '../utils/api';

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: '',
      showEditForm: false,
      showCreateForm: false,
      editingUser: null,
      selectedUser: null,
      formData: {
        id: '',
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: ''
      },
      createData: {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: ''
      }
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  // GET /users/register/ — fetch all users
  fetchUsers = async () => {
    this.setState({ loading: true, error: '' });
    try {
      const res = await API.get('/users/register/');
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      this.setState({ users: data, loading: false });
    } catch (err) {
      this.setState({ error: 'Failed to load users.', loading: false, users: [] });
    }
  };

  // GET /users/register/?id=<id> — fetch single user
  fetchUserById = async (id) => {
    try {
      const res = await API.get(`/users/register/?id=${id}`);
      this.setState({ selectedUser: res.data, showEditForm: false });
    } catch (err) {
      alert('Failed to fetch user details.');
    }
  };

  // PATCH /users/register/ — update user (id in body)
  handleUpdate = async (e) => {
    e.preventDefault();
    const { id, username, email, first_name, last_name, role } = this.state.formData;
    if (!id) return;
    try {
      const payload = { id };
      if (username) payload.username = username;
      if (email) payload.email = email;
      if (first_name) payload.first_name = first_name;
      if (last_name) payload.last_name = last_name;
      if (role) payload.role = role;

      await API.patch('/users/register/', payload);
      alert('✅ User updated successfully!');
      this.setState({ showEditForm: false, editingUser: null, selectedUser: null });
      this.fetchUsers();
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  // POST /users/register/ — create a new user (Manager only)
  handleCreate = async (e) => {
    e.preventDefault();
    const { username, email, password, first_name, last_name, role } = this.state.createData;
    if (!username || !password) {
      alert('Username and Password are required.');
      return;
    }
    try {
      await API.post('/users/register/', { username, email, password, first_name, last_name, role });
      alert('✅ User created successfully!');
      this.setState({
        showCreateForm: false,
        createData: { username: '', email: '', first_name: '', last_name: '', password: '', role: '' }
      });
      this.fetchUsers();
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create user.';
      alert(msg);
    }
  };

  // DELETE /users/register/<id>/ — delete user
  handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/register/${id}/`);
      alert('User deleted successfully.');
      this.setState({ selectedUser: null });
      this.fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  openEditForm = (user) => {
    this.setState({
      showEditForm: true,
      editingUser: user,
      selectedUser: null,
      formData: {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || ''
      }
    });
  };

  closeEditForm = () => {
    this.setState({ showEditForm: false, editingUser: null });
  };

  openCreateForm = () => {
    this.setState({
      showCreateForm: true,
      showEditForm: false,
      selectedUser: null,
      createData: { username: '', email: '', first_name: '', last_name: '', password: '', role: '' }
    });
  };

  closeCreateForm = () => {
    this.setState({ showCreateForm: false });
  };

  handleInputChange = (e) => {
    this.setState({ formData: { ...this.state.formData, [e.target.name]: e.target.value } });
  };

  handleCreateInputChange = (e) => {
    this.setState({ createData: { ...this.state.createData, [e.target.name]: e.target.value } });
  };

  getRoleBadge = (role) => {
    if (!role) return <span className="badge bg-secondary">—</span>;
    if (role === 'Manager') return <span className="badge bg-primary">Manager</span>;
    if (role === 'Admin') return <span className="badge bg-danger">Admin</span>;
    return <span className="badge bg-success">{role}</span>;
  };

  getInitials = (user) => {
    const first = user.first_name?.[0] || user.username?.[0] || '?';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  getAvatarColor = (id) => {
    const colors = ['#4361ee','#7209b7','#f72585','#4cc9f0','#3a0ca3','#560bad','#480ca8'];
    return colors[id % colors.length];
  };

  render() {
    const { users, loading, error, showEditForm, showCreateForm, editingUser, selectedUser, formData, createData } = this.state;
    const role = localStorage.getItem('role');
    const isManager = role === 'Manager';

    // ── DETAIL VIEW ──
    if (selectedUser) {
      const u = selectedUser;
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 680 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={() => this.setState({ selectedUser: null })}>
              ← Back
            </button>
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 text-white flex-shrink-0"
                    style={{ width: 72, height: 72, background: this.getAvatarColor(u.id) }}
                  >
                    {this.getInitials(u)}
                  </div>
                  <div>
                    <h4 className="mb-1">{u.first_name || ''} {u.last_name || ''}</h4>
                    <p className="text-muted mb-1">@{u.username}</p>
                    {this.getRoleBadge(u.role)}
                  </div>
                </div>
                <hr />
                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted text-uppercase fw-bold">Email</small>
                    <p>{u.email || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted text-uppercase fw-bold">User ID</small>
                    <p>{u.id}</p>
                  </div>
                  {u.date_joined && (
                    <div className="col-md-6">
                      <small className="text-muted text-uppercase fw-bold">Joined</small>
                      <p>{new Date(u.date_joined).toLocaleDateString()}</p>
                    </div>
                  )}
                  {u.is_active !== undefined && (
                    <div className="col-md-6">
                      <small className="text-muted text-uppercase fw-bold">Status</small>
                      <p>
                        {u.is_active
                          ? <span className="badge bg-success">Active</span>
                          : <span className="badge bg-danger">Inactive</span>}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => this.openEditForm(u)}>✏️ Edit User</button>
                  {isManager && (
                    <button className="btn btn-danger" onClick={() => this.handleDelete(u.id)}>🗑️ Delete User</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── CREATE FORM ──
    if (showCreateForm) {
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 600 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={this.closeCreateForm}>
              ← Back
            </button>
            <div className="card shadow">
              <div className="card-body p-4">
                <h5 className="mb-4">➕ Create New User</h5>
                <form onSubmit={this.handleCreate}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username <span className="text-danger">*</span></label>
                      <input
                        type="text" name="username" className="form-control"
                        value={createData.username} onChange={this.handleCreateInputChange} required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password <span className="text-danger">*</span></label>
                      <input
                        type="password" name="password" className="form-control"
                        value={createData.password} onChange={this.handleCreateInputChange} required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email" name="email" className="form-control"
                        value={createData.email} onChange={this.handleCreateInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select name="role" className="form-select" value={createData.role} onChange={this.handleCreateInputChange}>
                        <option value="">— Select Role —</option>
                        <option value="Manager">Manager</option>
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text" name="first_name" className="form-control"
                        value={createData.first_name} onChange={this.handleCreateInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text" name="last_name" className="form-control"
                        value={createData.last_name} onChange={this.handleCreateInputChange}
                      />
                    </div>
                    <div className="col-12 d-flex gap-2 mt-2">
                      <button type="submit" className="btn btn-primary">Create User</button>
                      <button type="button" className="btn btn-secondary" onClick={this.closeCreateForm}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── EDIT FORM ──
    if (showEditForm && editingUser) {
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 600 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={this.closeEditForm}>
              ← Back
            </button>
            <div className="card shadow">
              <div className="card-body p-4">
                <h5 className="mb-4">✏️ Edit User — <span className="text-muted">@{editingUser.username}</span></h5>
                <form onSubmit={this.handleUpdate}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text" name="username" className="form-control"
                        value={formData.username} onChange={this.handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email" name="email" className="form-control"
                        value={formData.email} onChange={this.handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text" name="first_name" className="form-control"
                        value={formData.first_name} onChange={this.handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text" name="last_name" className="form-control"
                        value={formData.last_name} onChange={this.handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select name="role" className="form-select" value={formData.role} onChange={this.handleInputChange}>
                        <option value="">— Select Role —</option>
                        <option value="Manager">Manager</option>
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-12 d-flex gap-2 mt-2">
                      <button type="submit" className="btn btn-success">Save Changes</button>
                      <button type="button" className="btn btn-secondary" onClick={this.closeEditForm}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── LIST VIEW ──
    return (
      <>
        <NavbarWrapper />
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>👥 Users Management</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-primary fs-6">{users.length} User{users.length !== 1 ? 's' : ''}</span>
              {isManager && (
                <button className="btn btn-primary" onClick={this.openCreateForm}>
                  + New User
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && users.length === 0 && (
            <div className="text-center text-muted my-5">
              No users found.
            </div>
          )}

          <div className="row g-3">
            {users.map(user => (
              <div className="col-md-6 col-lg-4" key={user.id}>
                <div
                  className="card shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onClick={() => this.fetchUserById(user.id)}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div className="card-body d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                      style={{ width: 52, height: 52, background: this.getAvatarColor(user.id), fontSize: 18 }}
                    >
                      {this.getInitials(user)}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className="mb-0 text-truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.username}
                      </h6>
                      <small className="text-muted text-truncate d-block">@{user.username}</small>
                      <div className="mt-1">{this.getRoleBadge(user.role)}</div>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent border-top-0 d-flex gap-2 pt-0 pb-3 px-3" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-sm btn-outline-warning flex-fill"
                      onClick={() => this.openEditForm(user)}
                    >
                      ✏️ Edit
                    </button>
                    {isManager && (
                      <button
                        className="btn btn-sm btn-outline-danger flex-fill"
                        onClick={() => this.handleDelete(user.id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Users;
