import React from 'react';
import './App.css';
import DataStore from './dataStore';
import Auth from './auth';
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
    await DataStore.deleteChatWithUser(
      otherUser((await Auth.current()).uid, this.props.messages));
    // todo go to another chat or to start when there's no other chat
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/*<button onClick={this.deleteChat}>Delete</button>*/}
          {/*<button onClick={this.props.goToCreateChat}>Create</button>*/}
          {/*<select onChange={e => this.props.goToChat(JSON.parse(e.target.value))}>*/}
          {/*  <option defaultValue>Select chat</option>*/}
          {/*  {this.props.chatss.map(chat =>*/}
          {/*    <option key={chat.code}*/}
          {/*            value={JSON.stringify(chat)}>*/}
          {/*      {chat.name}*/}
          {/*    </option>*/}
          {/*  )}*/}
          {/*</select>*/}
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
