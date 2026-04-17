import React, { Component } from 'react';

class DarkModeToggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDark: localStorage.getItem('darkMode') === 'true' || false
    };
  }

  componentDidMount() {
    if (this.state.isDark) {
      document.body.classList.add('bg-dark', 'text-light');
    }
  }

  toggleDarkMode = () => {
    const newMode = !this.state.isDark;
    this.setState({ isDark: newMode });

    if (newMode) {
      document.body.classList.add('bg-dark', 'text-light');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('bg-dark', 'text-light');
      localStorage.setItem('darkMode', 'false');
    }
  };

  render() {
    return (
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkModeSwitch"
          checked={this.state.isDark}
          onChange={this.toggleDarkMode}
        />
        <label className="form-check-label text-light ms-2" htmlFor="darkModeSwitch">
          Dark Mode
        </label>
      </div>
    );
  }
}

export default DarkModeToggle;