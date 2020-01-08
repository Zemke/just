import React from 'react';
import DataStore from './dataStore';

export default class EnterAnotherCode extends React.Component {

  state = {anotherCode: '', firstMessage: ''};

  onSubmit =  async e => {
    e.preventDefault();
    await DataStore.sendMessage({
      to: this.state.anotherCode,
      from: this.props.currentUser.uid,
      body: this.state.firstMessage,
    });
  };

  render() {
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <input value={this.state.anotherCode}
               placeholder="The other person’s code"
               onChange={e => this.setState({anotherCode: e.target.value})}/>
        <input value={this.state.firstMessage}
               placeholder="Your first message"
               onChange={e => this.setState({firstMessage: e.target.value})}/>
        <button type="submit">Submit</button>
      </form>
    );
  }
}