import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';
import API from '../utils/api';

class Analytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analytics: null,
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    this.fetchAnalytics();
  }

  fetchAnalytics = async () => {
    this.setState({ loading: true, error: '' });

    try {
      const response = await API.get('/analytics/');
      this.setState({
        analytics: response.data,
        loading: false
      });
    } catch (err) {
      this.setState({
        error: 'Failed to load analytics. Make sure you are logged in.',
        loading: false
      });
      console.error(err);
    }
  };

  render() {
    const { analytics, loading, error } = this.state;

    return (
      <>
        <NavbarWrapper />
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Analytics Overview</h2>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={this.fetchAnalytics}
            >
              Refresh
            </button>
          </div>

          {loading && <div className="text-center my-5"><div className="spinner-border text-primary"></div></div>}

          {error && <div className="alert alert-danger">{error}</div>}

          {analytics && (
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Total Tasks</h5>
                    <h2 className="text-primary">{analytics.total_tasks}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Completed Tasks</h5>
                    <h2 className="text-success">{analytics.completed_tasks}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Overdue Tasks</h5>
                    <h2 className="text-danger">{analytics.overdue_tasks}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Total Projects</h5>
                    <h2>{analytics.total_projects}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Active Projects</h5>
                    <h2 className="text-primary">{analytics.active_projects}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Completed Projects</h5>
                    <h2 className="text-success">{analytics.completed_projects}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h5 className="text-muted">Total Teams</h5>
                    <h2>{analytics.total_teams}</h2>
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

export default Analytics;