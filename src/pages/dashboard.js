import React, { Component } from 'react';
import NavbarWrapper from '../components/navbar';

class Dashboard extends Component {
  render() {
    return (
      <>
        <NavbarWrapper />
        
        <div className="container mt-4">
          <div className="row">
            <div className="col-12">
              <h2 className="mb-4">Dashboard</h2>
              <div className="alert alert-info">
                Welcome to TaskFlow Dashboard!<br />
                You are successfully logged in.
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="text-primary">Total Tasks</h5>
                  <h3 className="mt-2">24</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="text-success">Completed</h5>
                  <h3 className="mt-2">18</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="text-warning">In Progress</h5>
                  <h3 className="mt-2">5</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="text-danger">Overdue</h5>
                  <h3 className="mt-2">1</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Dashboard;