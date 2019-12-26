import React from 'react';
import './App.css';
import DataStore from './dataStore';

export default class AppComponent extends React.Component {

  state = {field: ''};

  onChange = async () => {
    await DataStore.sendMessage(this.state.field);
    this.setState({field: ''});
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Just</h1>
          <form>
            <input onChange={this.onChange} value={this.state.field}/>
          </form>
        </header>
      </div>
    );
  }
}
