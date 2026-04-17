import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import API from '../utils/api';

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      loading: true,
      error: '',
      showForm: false,
      editingTeam: null,           // For edit mode
      selectedTeam: null,          // For detail view
      formData: {
        name: '',
        description: ''
      }
    };
  }

  componentDidMount() {
    this.fetchTeams();
  }

  fetchTeams = async () => {
    try {
      const response = await API.get('/teams/');
      this.setState({
        teams: response.data,
        loading: false
      });
    } catch (err) {
      this.setState({ error: 'Failed to load teams', loading: false });
      console.error(err);
    }
  };

  // Open form for Create
  openCreateForm = () => {
    this.setState({
      showForm: true,
      editingTeam: null,
      formData: { name: '', description: '' }
    });
  };

  // Open form for Edit
  openEditForm = (team) => {
    this.setState({
      showForm: true,
      editingTeam: team,
      selectedTeam: null,
      formData: {
        name: team.name,
        description: team.description
      }
    });
  };

  openDetailView = (team) => {
    this.setState({ selectedTeam: team, showForm: false, editingTeam: null });
  };

  closeDetailView = () => {
    this.setState({ selectedTeam: null });
  };

  handleInputChange = (e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [e.target.name]: e.target.value
      }
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description } = this.state.formData;

    if (!name || !description) {
      alert("Name and Description are required");
      return;
    }

    try {
      if (this.state.editingTeam) {
        // Update existing team
        await API.patch(`/teams/`, {
          id: this.state.editingTeam.id,
          name: name,
          description: description
        });
        alert("Team updated successfully!");
      } else {
        // Create new team
        await API.post('/teams/', { name, description });
        alert("Team created successfully!");
      }

      this.setState({ showForm: false, editingTeam: null, formData: { name: '', description: '' } });
      this.fetchTeams(); // Refresh list
    } catch (err) {
      alert(this.state.editingTeam ? "Failed to update team" : "Failed to create team");
      console.error(err);
    }
  };

  handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      await API.delete(`/teams/${id}/`);
      alert("Team deleted successfully");
      this.fetchTeams();
    } catch (err) {
      alert("Failed to delete team");
      console.error(err);
    }
  };

  render() {
    const { teams, loading, error, showForm, formData, editingTeam, selectedTeam } = this.state;

    // ── DETAIL VIEW ──
    if (selectedTeam) {
      const team = selectedTeam;
      return (
        <>
          <NavbarWrapper />
          <div className="container mt-4" style={{ maxWidth: 720 }}>
            <button className="btn btn-outline-secondary mb-4" onClick={this.closeDetailView}>
              ← Back
            </button>

            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center py-3">
                <h4 className="mb-0">{team.name}</h4>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-12">
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Description</h6>
                    <p className="mb-0">{team.description || '—'}</p>
                  </div>
                  {team.created_at && (
                    <div className="col-md-6">
                      <h6 className="text-muted text-uppercase small fw-bold mb-1">Created At</h6>
                      <p className="mb-0">{new Date(team.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => this.openEditForm(team)}>
                    ✏️ Edit Team
                  </button>
                  <button className="btn btn-danger" onClick={() => {
                    this.handleDeleteTeam(team.id);
                    this.closeDetailView();
                  }}>
                    🗑️ Delete Team
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
            <h2>Teams Management</h2>
            <button 
              className="btn btn-primary"
              onClick={this.openCreateForm}
            >
              + New Team
            </button>
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5>{editingTeam ? 'Edit Team' : 'Create New Team'}</h5>
                <form onSubmit={this.handleSubmit}>
                  <div className="row">
                    <div className="col-md-5">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Team Name"
                        value={formData.name}
                        onChange={this.handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        placeholder="Description"
                        value={formData.description}
                        onChange={this.handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-success w-100">
                        {editingTeam ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading && <div className="text-center my-5"><div className="spinner-border"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Teams List */}
          <div className="row">
            {teams.map(team => (
              <div className="col-md-6 mb-3" key={team.id}>
                <div 
                  className="card shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => this.openDetailView(team)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title">{team.name}</h5>
                        <p className="card-text text-muted">{team.description}</p>
                        <small className="text-muted">
                          Created: {new Date(team.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <button 
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => this.openEditForm(team)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => this.handleDeleteTeam(team.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {teams.length === 0 && !loading && (
            <div className="text-center text-muted my-5">
              No teams found. Create your first team.
            </div>
          )}
        </div>
      </>
    );
  }
}

export default Teams;