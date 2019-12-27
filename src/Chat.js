import React from 'react';
import './App.css';
import DataStore from './dataStore';
import otherUser from "./otherUser";

export default class AppComponent extends React.Component {

  state = {
    field: '',
    otherUser: otherUser(
      this.props.currentUser.uid,
      this.props.messages
        .sort((c1, c2) => c1 - c2))
  };

  onChange = async val => this.setState({field: val});

  onSubmit = async e => {
    e.preventDefault();
    const payload = {
      from: this.props.currentUser.uid,
      to: this.state.otherUser,
      body: this.state.field
    };
    await DataStore.sendMessage(payload);
    this.setState({field: ''});
  };

  deleteChat = async () => {
    if (!window.confirm("The chat will be irreversibly deleted. Are you sure?")) {
      return;
    }
    await DataStore.deleteChatWithUser(this.state.otherUser);
    // todo go to another chat or to start when there's no other chat
  };

  render() {
    const otherUsers = this.props.messages
      .reduce((acc, m) => {
        const otherUser1 = otherUser(this.props.currentUser.uid, [m]);
        if (otherUser1 === this.state.otherUser) return acc;
        if (acc.indexOf(otherUser1) === -1) acc.push(otherUser1);
        return acc;
      }, []);

    return (
      <div className="App">
        <header className="App-header">
          <button onClick={this.deleteChat}>Delete</button>
          {/*<button onClick={this.props.goToCreateChat}>Create</button>*/}
          <select onChange={e => this.setState({otherUser: e.target.value})}>
            <option defaultValue value={this.state.otherUser}>
              {this.state.otherUser}
            </option>
            {otherUsers.map(oU => <option key={oU} value={oU}>{oU}</option>)}
          </select>
          <h1>Just</h1>
          <form onSubmit={e => this.onSubmit(e)}>
            <input onChange={e => this.onChange(e.target.value)}
                   value={this.state.field}/>
          </form>

          {this.props.messages
            .filter(m =>
              otherUser(this.props.currentUser.uid, [m]) === this.state.otherUser)
            .sort((c1, c2) => c2.when - c1.when)
            .map(message =>
              <div key={message.id}>
                chat: {message.chat}<br/>
                from: {message.from}<br/> {/*todo map sender and receiver*/}
                to: {message.to}<br/>
                body: {message.body}<br/>
                when: {message.when}
              </div>
            )}
        </header>
      </div>
    );
  }
}
