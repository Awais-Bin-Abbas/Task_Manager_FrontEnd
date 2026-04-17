import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import API from '../utils/api';

class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      teams: [],
      loading: true,
      error: '',
      showForm: false,
      editingProject: null,
      selectedProject: null,
      formData: {
        name: '',
        description: '',
        team: '',
        deadline: '',
        status: 'Active'
      }
    };
  }

  componentDidMount() {
    this.fetchProjects();
    this.fetchTeams();
  }

  fetchProjects = async () => {
    try {
      const res = await API.get('/projects/');
      this.setState({ projects: res.data, loading: false });
    } catch (err) {
      this.setState({ error: 'Failed to load projects', loading: false });
    }
  };

  fetchTeams = async () => {
    try {
      const res = await API.get('/teams/');
      this.setState({ teams: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  handleInputChange = (e) => {
    this.setState({
      formData: { ...this.state.formData, [e.target.name]: e.target.value }
    });
  };

  openCreateForm = () => {
    this.setState({
      showForm: true,
      editingProject: null,
      formData: { name: '', description: '', team: '', deadline: '', status: 'Active' }
    });
  };

  openEditForm = (project) => {
    this.setState({
      showForm: true,
      editingProject: project,
      selectedProject: null,
      formData: {
        name: project.name,
        description: project.description,
        team: project.team.toString(),
        deadline: project.deadline,
        status: project.status
      }
    });
  };

  openDetailView = (project) => {
    this.setState({ selectedProject: project, showForm: false, editingProject: null });
  };

  closeDetailView = () => {
    this.setState({ selectedProject: null });
  };

  getTeamName = (teamId) => {
    const team = this.state.teams.find(t => t.id === parseInt(teamId));
    return team ? team.name : teamId || '—';
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, team, deadline, status } = this.state.formData;

    if (!name || !description || !team || !deadline) {
      alert("All fields are required!");
      return;
    }

    try {
      if (this.state.editingProject) {
        // UPDATE - Using query param as your backend expects
        await API.patch(`/projects/?id=${this.state.editingProject.id}`, {
          name: name,
          description: description,
          team: parseInt(team),
          deadline: deadline,
          status: status
        });
        alert("✅ Project updated successfully!");
      } else {
        // CREATE
        await API.post('/projects/', {
          name,
          description,
          team: parseInt(team),
          deadline,
          status
        });
        alert("✅ Project created successfully!");
      }

      this.setState({ showForm: false, editingProject: null });
      this.fetchProjects();        // Refresh projects list
    } catch (err) {
      console.error("Error:", err.response?.data || err);
      alert(this.state.editingProject ? "Failed to update project" : "Failed to create project");
    }
  };

  handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await API.delete(`/projects/?id=${id}`);
      alert("Project deleted successfully");
      this.fetchProjects();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  render() {
    const { projects, teams, loading, error, showForm, formData, editingProject, selectedProject } = this.state;

    // ── DETAIL VIEW ──
    if (selectedProject) {
      const project = selectedProject;
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 720 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={this.closeDetailView}>
              ← Back
            </button>

            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center py-3">
                <h4 className="mb-0">{project.name}</h4>
                <span className={`badge fs-6 ${project.status === 'Active' ? 'bg-primary' : 'bg-success'}`}>
                  {project.status}
                </span>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-12">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Description</h6>
                    <p className="mb-0">{project.description || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Team</h6>
                    <p className="mb-0">{this.getTeamName(project.team)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Deadline</h6>
                    <p className="mb-0">{project.deadline || '—'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => this.openEditForm(project)}>
                    ✏️ Edit Project
                  </button>
                  <button className="btn btn-danger" onClick={() => {
                    this.handleDeleteProject(project.id);
                    this.closeDetailView();
                  }}>
                    🗑️ Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <NavbarWrapper />
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Projects Management</h2>
            <button className="btn btn-primary" onClick={this.openCreateForm}>
              + New Project
            </button>
          </div>

          {showForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5>{editingProject ? 'Edit Project' : 'Create New Project'}</h5>
                <form onSubmit={this.handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Project Name</label>
                      <input type="text" name="name" className="form-control" value={formData.name} onChange={this.handleInputChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Team</label>
                      <select name="team" className="form-select" value={formData.team} onChange={this.handleInputChange} required>
                        <option value="">Select Team</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label>Description</label>
                      <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={this.handleInputChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Deadline</label>
                      <input type="date" name="deadline" className="form-control" value={formData.deadline} onChange={this.handleInputChange} required />
                    </div>

                    <div className="col-md-6">
                      <label>Status</label>
                      <select name="status" className="form-select" value={formData.status} onChange={this.handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-success me-2">
                        {editingProject ? 'Update Project' : 'Create Project'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => this.setState({ showForm: false, editingProject: null })}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading && <div className="text-center my-5"><div className="spinner-border"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            {projects.map(project => (
              <div className="col-md-6 mb-3" key={project.id}>
                <div 
                  className="card shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => this.openDetailView(project)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h5>{project.name}</h5>
                      <span className={`badge ${project.status === 'Active' ? 'bg-primary' : 'bg-success'}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-muted">{project.description}</p>
                    <p className="small text-muted">
                      Deadline: {project.deadline} | Team: {this.getTeamName(project.team)}
                    </p>
                    <div className="mt-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => this.openEditForm(project)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => this.handleDeleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default Projects;