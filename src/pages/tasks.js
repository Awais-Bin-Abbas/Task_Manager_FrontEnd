import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import API from '../utils/api';

class Tasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      projects: [],
      users: [],
      loading: true,
      error: '',
      showForm: false,
      editingTask: null,
      selectedTask: null,
      currentPage: 1,
      totalPages: 1,
      formData: {
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        priority: 'Medium',
        status: 'Todo',
        due_date: ''
      }
    };
  }

  componentDidMount() {
    this.fetchTasks(1);
    this.fetchProjects();
    this.fetchUsers();
  }

  fetchTasks = async (page = 1) => {
    this.setState({ loading: true, error: '' });
    try {
      const res = await API.get(`/tasks/?page=${page}`);
      this.setState({
        tasks: Array.isArray(res.data.results) ? res.data.results : [],
        currentPage: page,
        totalPages: res.data.total_pages || 1,
        loading: false
      });
    } catch (err) {
      this.setState({ error: 'Failed to load tasks.', loading: false, tasks: [] });
    }
  };

  fetchProjects = async () => {
    try {
      const res = await API.get('/projects/');
      this.setState({ projects: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {}
  };

  fetchUsers = async () => {
    try {
      const res = await API.get('/auth/register/');
      this.setState({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {}
  };

  handleInputChange = (e) => {
    this.setState({ formData: { ...this.state.formData, [e.target.name]: e.target.value } });
  };

  openCreateForm = () => {
    this.setState({
      showForm: true,
      editingTask: null,
      selectedTask: null,
      formData: { title: '', description: '', project: '', assigned_to: '', priority: 'Medium', status: 'Todo', due_date: '' }
    });
  };

  openEditForm = (task) => {
    this.setState({
      showForm: true,
      editingTask: task,
      selectedTask: null,
      formData: {
        title: task.title || '',
        description: task.description || '',
        project: task.project ? task.project.toString() : '',
        assigned_to: task.assigned_to ? task.assigned_to.toString() : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        due_date: task.due_date || ''
      }
    });
  };

  openDetailView = (task) => {
    this.setState({ selectedTask: task, showForm: false, editingTask: null });
  };

  closeDetailView = () => {
    this.setState({ selectedTask: null });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, project, assigned_to, priority, status, due_date } = this.state.formData;
    if (!title || !description || !project || !due_date) {
      alert("Title, Description, Project and Due Date are required!");
      return;
    }
    try {
      const payload = { title, description, project: parseInt(project), assigned_to: assigned_to ? parseInt(assigned_to) : null, priority, status, due_date };
      if (this.state.editingTask) {
        await API.patch('/tasks/', { id: this.state.editingTask.id, ...payload });
        alert("✅ Task updated successfully!");
      } else {
        await API.post('/tasks/', payload);
        alert("✅ Task created successfully!");
      }
      this.setState({ showForm: false, editingTask: null });
      this.fetchTasks(this.state.currentPage);
    } catch (err) {
      alert(this.state.editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}/`);
      alert("Task deleted successfully");
      this.setState({ selectedTask: null });
      this.fetchTasks(this.state.currentPage);
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > this.state.totalPages) return;
    this.fetchTasks(newPage);
  };

  getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-success';
    if (status === 'In Progress') return 'bg-warning text-dark';
    if (status === 'Review') return 'bg-info text-dark';
    return 'bg-secondary';
  };

  getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-danger fw-bold';
    if (priority === 'Medium') return 'text-warning fw-bold';
    return 'text-success fw-bold';
  };

  isOverdue = (due_date, status) => {
    return due_date && new Date(due_date) < new Date() && status !== 'Completed';
  };

  getProjectName = (projectId) => {
    const project = this.state.projects.find(p => p.id === parseInt(projectId));
    return project ? project.name : projectId || '—';
  };

  getUserName = (userId) => {
    const user = this.state.users.find(u => u.id === parseInt(userId));
    return user ? user.username : userId || 'Unassigned';
  };

  render() {
    const { tasks, projects, users, loading, error, showForm, formData, editingTask, selectedTask, currentPage, totalPages } = this.state;

    // ── DETAIL VIEW ──
    if (selectedTask) {
      const task = selectedTask;
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 720 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={this.closeDetailView}>
              ← Back
            </button>

            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center py-3">
                <h4 className="mb-0">{task.title}</h4>
                <span className={`badge fs-6 ${this.getStatusColor(task.status)}`}>{task.status}</span>
              </div>
              <div className="card-body">
                <div className="row g-4">

                  <div className="col-12">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Description</h6>
                    <p className="mb-0">{task.description || '—'}</p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Project</h6>
                    <p className="mb-0">{this.getProjectName(task.project)}</p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Assigned To</h6>
                    <p className="mb-0">{this.getUserName(task.assigned_to)}</p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Priority</h6>
                    <p className={`mb-0 ${this.getPriorityColor(task.priority)}`}>{task.priority}</p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Due Date</h6>
                    <p className={`mb-0 ${this.isOverdue(task.due_date, task.status) ? 'text-danger fw-bold' : ''}`}>
                      {task.due_date || '—'}
                      {this.isOverdue(task.due_date, task.status) && <span className="badge bg-danger ms-2">Overdue</span>}
                    </p>
                  </div>

                  {task.created_at && (
                    <div className="col-md-6">
                      <h6 className="text-muted text-uppercase small fw-bold mb-1">Created At</h6>
                      <p className="mb-0">{new Date(task.created_at).toLocaleDateString()}</p>
                    </div>
                  )}

                  {task.updated_at && (
                    <div className="col-md-6">
                      <h6 className="text-muted text-uppercase small fw-bold mb-1">Last Updated</h6>
                      <p className="mb-0">{new Date(task.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => this.openEditForm(task)}>
                    ✏️ Edit Task
                  </button>
                  <button className="btn btn-danger" onClick={() => this.handleDeleteTask(task.id)}>
                    🗑️ Delete Task
                  </button>
                </div>
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
            <h2>Tasks Management</h2>
            <button className="btn btn-primary" onClick={this.openCreateForm}>+ New Task</button>
          </div>

          {showForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5>{editingTask ? 'Edit Task' : 'Create New Task'}</h5>
                <form onSubmit={this.handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Title</label>
                      <input type="text" name="title" className="form-control" value={formData.title} onChange={this.handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Project</label>
                      <select name="project" className="form-select" value={formData.project} onChange={this.handleInputChange} required>
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={this.handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Assigned To</label>
                      <select name="assigned_to" className="form-select" value={formData.assigned_to} onChange={this.handleInputChange}>
                        <option value="">Unassigned</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Due Date</label>
                      <input type="date" name="due_date" className="form-control" value={formData.due_date} onChange={this.handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label>Priority</label>
                      <select name="priority" className="form-select" value={formData.priority} onChange={this.handleInputChange}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Status</label>
                      <select name="status" className="form-select" value={formData.status} onChange={this.handleInputChange}>
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-success me-2">{editingTask ? 'Update Task' : 'Create Task'}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => this.setState({ showForm: false, editingTask: null })}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading && <div className="text-center my-5"><div className="spinner-border text-primary"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            {tasks && tasks.length > 0 ? (
              tasks.map(task => (
                <div className="col-md-6 mb-3" key={task.id}>
                  <div
                    className="card shadow-sm h-100"
                    style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onClick={() => this.openDetailView(task)}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <h5>{task.title}</h5>
                        <span className={`badge ${this.getStatusColor(task.status)}`}>{task.status}</span>
                      </div>
                      <p className="text-muted">{task.description}</p>
                      <p className="small text-muted mb-2">
                        Due: {task.due_date} | Priority: <span className={this.getPriorityColor(task.priority)}>{task.priority}</span>
                      </p>
                      {this.isOverdue(task.due_date, task.status) && (
                        <span className="badge bg-danger">Overdue</span>
                      )}
                      <div className="mt-2" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => this.openEditForm(task)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => this.handleDeleteTask(task.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !loading && !error && (
                <div className="text-center text-muted my-5">
                  No tasks found yet.<br />Click "+ New Task" to create your first task.
                </div>
              )
            )}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-2">
              <button className="btn btn-outline-primary" onClick={() => this.handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              <span className="align-self-center mx-3">Page {currentPage} of {totalPages}</span>
              <button className="btn btn-outline-primary" onClick={() => this.handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default Tasks;